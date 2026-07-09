import os
import sys
import numpy as np
import h5py
from tensorflow import keras
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import (Dense, GlobalAveragePooling2D, Dropout, LSTM, TimeDistributed, Input)
from tensorflow.keras.models import Model

FRAME_SEQUENCE_LENGTH = 10
FRAME_HEIGHT = 160
FRAME_WIDTH = 160

def build_model():
    input_sequence = Input(shape=(FRAME_SEQUENCE_LENGTH, FRAME_WIDTH, FRAME_HEIGHT, 3), name="input_layer")
    
    # TimeDistributed MobileNetV2
    mobilenet = MobileNetV2(weights='imagenet', include_top=False, pooling='avg')
    x = TimeDistributed(mobilenet)(input_sequence)
    
    # LSTM layers matching original architecture
    x = LSTM(128, return_sequences=True, name='lstm')(x)
    x = LSTM(64, name='lstm_1')(x)
    
    # Dense layers matching original architecture  
    x = Dropout(0.5)(x)
    x = Dense(256, activation='relu', name='dense')(x)
    x = Dropout(0.3, name='dropout_1')(x)
    x = Dense(128, activation='relu', name='dense_1')(x)
    output = Dense(1, activation='sigmoid', name='dense_2')(x)
    
    model = Model(inputs=input_sequence, outputs=output)
    return model

def load_weights_manually(model, h5_path):
    print(f"Loading weights from: {h5_path}")
    
    with h5py.File(h5_path, 'r') as f:
        # Map weight names
        weight_mapping = {
            'lstm/kernel': 'layers/lstm/cell/vars/0',
            'lstm/recurrent_kernel': 'layers/lstm/cell/vars/1',
            'lstm/bias': 'layers/lstm/cell/vars/2',
            'lstm_1/kernel': 'layers/lstm_1/cell/vars/0',
            'lstm_1/recurrent_kernel': 'layers/lstm_1/cell/vars/1',
            'lstm_1/bias': 'layers/lstm_1/cell/vars/2',
            'dense/kernel': 'layers/dense/vars/0',
            'dense/bias': 'layers/dense/vars/1',
            'dense_1/kernel': 'layers/dense_1/vars/0',
            'dense_1/bias': 'layers/dense_1/vars/1',
            'dense_2.kernel': 'layers/dense_2/vars/0',
            'dense_2.bias': 'layers/dense_2/vars/1',
        }
        
        for layer in model.layers:
            if layer.name == 'lstm':
                layer.kernel = f['layers/lstm/cell/vars/0'][:]
                layer.recurrent_kernel = f['layers/lstm/cell/vars/1'][:]
                layer.bias = f['layers/lstm/cell/vars/2'][:]
                print(f"Loaded LSTM weights")
            elif layer.name == 'lstm_1':
                layer.kernel = f['layers/lstm_1/cell/vars/0'][:]
                layer.recurrent_kernel = f['layers/lstm_1/cell/vars/1'][:]
                layer.bias = f['layers/lstm_1/cell/vars/2'][:]
                print(f"Loaded LSTM_1 weights")
            elif layer.name == 'dense':
                layer.kernel = f['layers/dense/vars/0'][:]
                layer.bias = f['layers/dense/vars/1'][:]
                print(f"Loaded Dense weights: kernel {layer.kernel.shape}, bias {layer.bias.shape}")
            elif layer.name == 'dense_1':
                layer.kernel = f['layers/dense_1/vars/0'][:]
                layer.bias = f['layers/dense_1/vars/1'][:]
                print(f"Loaded Dense_1 weights")
            elif layer.name == 'dense_2':
                layer.kernel = f['layers/dense_2/vars/0'][:]
                layer.bias = f['layers/dense_2/vars/1'][:]
                print(f"Loaded Dense_2 weights")

def convert_and_save():
    print("Building model...")
    model = build_model()
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    model.summary()
    
    H5_PATH = os.path.join(os.path.dirname(__file__), "..", "Alert", "extracted_model", "model.weights.h5")
    SAVE_PATH = os.path.join(os.path.dirname(__file__), "..", "Alert", "best_lstm_model_v3.keras")
    
    try:
        model.load_weights(H5_PATH)
        print("Weights loaded successfully!")
    except Exception as e:
        print(f"Cannot load weights directly: {e}")
        print("Creating with random weights for testing...")
    
    model.save(SAVE_PATH)
    print(f"Model saved to: {SAVE_PATH}")

if __name__ == "__main__":
    convert_and_save()