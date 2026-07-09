import { motion } from "framer-motion"
import { Card } from "./Card"
import { Button } from "./Button"
import { SectionLabel } from "./SectionLabel"
import { ArrowRightIcon, CodeIcon, BrainIcon, ShieldIcon, ClockIcon, ZapIcon, GlobeIcon, Mail } from "lucide-react"

export function AuthorPage() {
  const team = [
    {
      name: "Mahesh Karki",
      role: "Full Stack Developer",
      initials: "MK",
      github: "https://github.com/Maheshkarkii",
      bio: "Full Stack Developer focused on building robust web systems, integration, and cloud deployments."
    },
    {
      name: "Anil Paneru",
      role: "AI/ML Developer",
      initials: "AP",
      github: "https://github.com/Theani7",
      bio: "Full Stack Developer specializing in AI/ML solutions, computer vision, and building intelligent systems."
    },
    {
      name: "Rahul Mishra",
      role: "AI/ML Developer",
      initials: "RM",
      github: "#",
      bio: "Specializing in neural networks, video processing models, and deep learning architectures."
    }
  ]

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 dot-pattern" />
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-accent blur-[150px] opacity-10" />
        
        <div className="relative mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <SectionLabel pulse>About the Developers</SectionLabel>
            <h1 className="font-display text-4xl md:text-5xl mt-6">Meet Our Team</h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
              We are a team of developers combining full-stack expertise with deep learning to build intelligent systems.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {team.map((member, idx) => (
              <motion.div
                key={member.name}
                className="flex flex-col items-center text-center p-6 bg-card/50 backdrop-blur-md rounded-2xl border border-border/50 hover:border-accent/50 transition-all duration-300 shadow-lg hover:shadow-accent/5"
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 * (idx + 1) }}
              >
                <div className="relative mb-6">
                  <div className="h-24 w-24 rounded-full gradient-bg p-[3px]">
                    <div className="h-full w-full rounded-full bg-card flex items-center justify-center">
                      <span className="font-display text-2xl">{member.initials}</span>
                    </div>
                  </div>
                </div>

                <h3 className="font-display text-2xl mb-1">{member.name}</h3>
                <p className="text-accent text-sm font-medium mb-4">{member.role}</p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">{member.bio}</p>

                {member.github !== "#" && (
                  <Button variant="secondary" size="sm">
                    <a href={member.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <GlobeIcon className="h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <SectionLabel>Skills & Expertise</SectionLabel>
            <h2 className="mt-6 font-display text-3xl md:text-4xl">What We Work With</h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BrainIcon, title: "AI/ML", desc: "Deep Learning, CNN, LSTM, Computer Vision" },
              { icon: CodeIcon, title: "Full Stack", desc: "React, FastAPI, Node.js, Python" },
              { icon: ShieldIcon, title: "Security", desc: "JWT Auth, CVE, Best Practices" },
              { icon: ZapIcon, title: "Performance", desc: "Optimization, Caching, Scaling" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 * i }}
              >
                <Card hover className="text-center p-6">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl gradient-bg">
                    <item.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-display text-xl mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-foreground py-20 text-background md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-10" />
        
        <div className="relative mx-auto max-w-6xl px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <SectionLabel className="border-accent/30 bg-accent/5">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Project Details
            </SectionLabel>
            <h2 className="mt-6 font-display text-3xl md:text-4xl">About This Project</h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <Card className="h-full border-accent/20 bg-transparent text-background">
                <h3 className="font-display text-xl mb-4 text-white">Violence Detection System</h3>
                <p className="text-white/70 mb-4">
                  An advanced AI-powered system designed to detect violent content in videos using deep learning.
                  The model uses a hybrid CNN-LSTM architecture combining MobileNetV2 for feature extraction with
                  LSTM networks for temporal sequence analysis.
                </p>
                <ul className="text-sm text-white/70 space-y-2">
                  <li className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-accent" />
                    Real-time video analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <BrainIcon className="h-4 w-4 text-accent" />
                    97% detection accuracy
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldIcon className="h-4 w-4 text-accent" />
                    Binary classification
                  </li>
                </ul>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <Card className="h-full border-accent/20 bg-transparent text-background">
                <h3 className="font-display text-xl mb-4 text-white">Tech Stack</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-accent mb-2">Backend</h4>
                    <p className="text-sm text-white/70">FastAPI, TensorFlow, Keras, OpenCV</p>
                  </div>
                  <div>
                    <h4 className="text-accent mb-2">Frontend</h4>
                    <p className="text-sm text-white/70">React, Vite, Tailwind, Framer Motion</p>
                  </div>
                  <div>
                    <h4 className="text-accent mb-2">Authentication</h4>
                    <p className="text-sm text-white/70">JWT Tokens, bcrypt password hashing</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-display text-3xl md:text-4xl">Get In Touch</h2>
            <p className="mt-4 text-muted-foreground">
              Interested in collaboration or have questions about this project?
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button>
                <a href="https://github.com/Maheshkarkii/violence-detection-cnn-lstm" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <GlobeIcon className="h-5 w-5" />
                  View GitHub
                  <ArrowRightIcon className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="secondary">
                <a href="mailto:karkimahesh305@gmail.com" className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Me
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}