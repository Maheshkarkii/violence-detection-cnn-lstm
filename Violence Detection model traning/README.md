# Violence Detection Model Training

This directory contains the code for training the Violence Detection model using a hybrid architecture of **MobileNetV2** and **LSTM**. The model is designed to classify video sequences as either "Violence" or "Non-Violence".

## Notebook: `mobilenetv2-with-lstm-with-97-accuracy.ipynb`

This Jupyter Notebook contains the complete pipeline for data loading, preprocessing, model construction, training, and evaluation.

### 1. Model Architecture
The system uses a **Time-Distributed CNN + LSTM** architecture:
-   **Feature Extractor**: `MobileNetV2` (pre-trained on ImageNet) is applied to each frame in the video sequence to extract high-level visual features.
-   **Temporal Processing**: `LSTM` (Long Short-Term Memory) layers process the sequence of frame features to understand the temporal dynamics and motion patterns associated with violence.
-   **Classifier**: Dense layers with Dropout for regularization and a final Sigmoid output layer for binary classification.

### 2. Data Preprocessing
-   **Video Data Generator**: A custom `LSTMVideoDataGenerator` is used to efficiently load and process video files.
-   **Frame Extraction**: Instead of averaging frames, the generator extracts a sequence of **10 frames** from each video.
-   **Resizing**: All frames are resized to **160x160** pixels.
-   **Augmentation**: Data augmentation (rotation, shift, flip, brightness) is applied during training to improve model generalization.

### 3. Training Process
The training is divided into two phases to ensure stability and high performance:

#### Phase 1: Transfer Learning (Frozen Base)
-   **Objective**: Train the LSTM and Dense layers while keeping the MobileNetV2 feature extractor frozen.
-   **Epochs**: 8
-   **Learning Rate**: 0.001
-   **Outcome**: The model learns to interpret the features extracted by MobileNetV2 without modifying the pre-trained weights.

#### Phase 2: Fine-Tuning
-   **Objective**: Unfreeze the top 30 layers of MobileNetV2 and fine-tune the entire model.
-   **Epochs**: 8
-   **Learning Rate**: 0.0001 (Lower learning rate to prevent destroying pre-trained weights).
-   **Outcome**: The feature extractor adapts specifically to the violence detection task, further improving accuracy.

### 4. Evaluation
The model is evaluated on a test set (15% of the dataset) using:
-   **Accuracy**: The percentage of correctly classified videos.
-   **Confusion Matrix**: To visualize false positives and false negatives.
-   **Classification Report**: Precision, Recall, and F1-Score for both classes.

### 5. Usage
To train the model yourself:
1.  Ensure you have the dataset (Real Life Violence Situations Dataset) available.
2.  Update the `VIOLENCE_PATH` and `NON_VIOLENCE_PATH` variables in the `main()` function to point to your dataset directories.
3.  Run all cells in the notebook.
4.  The best model will be saved as `best_lstm_model_final.keras`.

### 6. Key Advantages
-   **Temporal Awareness**: Unlike simple frame-by-frame classification, this model understands the *sequence* of events, making it better at distinguishing violent actions from static violent scenes.
-   **Efficiency**: MobileNetV2 is lightweight, making the model suitable for real-time applications.