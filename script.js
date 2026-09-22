// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initNeuralCanvas();
    initProjectFilters();
    initProjectModals();
});

/* ========================================================================= */
/* 1. HEADER & NAVBAR INTERACTIVITY                                          */
/* ========================================================================= */
function initNavbar() {
    const header = document.querySelector('.header');
    const navToggle = document.getElementById('nav-toggle-btn');
    const mobileMenu = document.getElementById('mobile-nav-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    // Sticky navbar on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Toggle Mobile Nav Menu
    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.contains('open');
            if (isOpen) {
                mobileMenu.classList.remove('open');
                navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
            } else {
                mobileMenu.classList.add('open');
                navToggle.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            }
        });

        // Close menu on link click
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
            });
        });
    }
}

/* ========================================================================= */
/* 2. DYNAMIC NEURAL BACKGROUND (CANVAS INTERACTIVE PARTICLES)                */
/* ========================================================================= */
function initNeuralCanvas() {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };

    // Set canvas dimensions
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    }

    // Particle Object Blueprint
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.baseSize = Math.random() * 2.5 + 1;
            this.size = this.baseSize;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.glowOpacity = Math.random() * 0.5 + 0.3;
        }

        update() {
            // Border collisions with wrap-around
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;

            // React to mouse attraction/interaction
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    // Move slightly towards mouse
                    this.x -= dx * force * 0.03;
                    this.y -= dy * force * 0.03;
                    this.size = this.baseSize + force * 2.5;
                } else {
                    if (this.size > this.baseSize) {
                        this.size -= 0.1;
                    }
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(138, 43, 226, ${this.glowOpacity})`; // Deep purple particles
            ctx.fill();
        }
    }

    // Initialize particle pool based on screen size
    function initParticles() {
        particles = [];
        const count = Math.floor((canvas.width * canvas.height) / 13000);
        for (let i = 0; i < count; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            particles.push(new Particle(x, y));
        }
    }

    // Draw connecting synapses
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 110) {
                    const alpha = (110 - dist) / 110 * 0.16;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    
                    // Gradient connection between neon cyan and electric purple
                    let grad = ctx.createLinearGradient(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                    grad.addColorStop(0, `rgba(0, 245, 255, ${alpha})`); // Cyan
                    grad.addColorStop(1, `rgba(138, 43, 226, ${alpha})`); // Purple
                    
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
    }

    // Canvas animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        drawConnections();
        requestAnimationFrame(animate);
    }

    // Event Listeners for Canvas Interactivity
    window.addEventListener('resize', resizeCanvas);
    
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Fire up
    resizeCanvas();
    animate();
}

/* ========================================================================= */
/* 3. PROJECT FILTER CONTROLS                                                */
/* ========================================================================= */
function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from buttons, add to current
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                // Animate transition of card filtering
                if (filterValue === 'all' || cardCategory === filterValue) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

/* ========================================================================= */
/* 4. DYNAMIC MODALS (ARCHITECTURE & SPECS DETAILED SHOWCASE)                */
/* ========================================================================= */
function initProjectModals() {
    const modalOverlay = document.getElementById('project-modal');
    const modalInner = document.getElementById('modal-inner-content');
    const modalClose = document.getElementById('modal-close-btn');
    const detailButtons = document.querySelectorAll('.btn-card-detail');

    // Portfolio Project Data Object (Based on Resume and GitHub)
    const projectDatabase = {
        faceattend: {
            title: "Intelligent Face And Voice Attendance System",
            category: "Computer Vision / Multimodal AI",
            overview: "Developed a multimodal biometric attendance platform that identifies students using both facial and voice embeddings. The system provides separate Teacher and Student portals: teachers can create subjects, generate QR-based enrollment links, manage attendance sessions, and review records, while students register their biometric identity and self-enroll in subjects via QR code.",
            architecture: `
  [Student Face / Voice Input]
         |
         v
  [Feature Extraction Layer]
  ├── Face Pipeline:  Dlib → facial landmarks → 128-d face encoding → face embedding
  └── Voice Pipeline: Audio → Librosa / Resemblyzer → d-vector voice embedding
         |
         v
  [Supabase PostgreSQL  ←  embeddings stored per student]
         |
         v
  [SVM / SVC Classifier  →  Student Identity]
         |
         v
  [Attendance Record written to Supabase]

  Teacher Portal → Subject Creation → QR Enrollment Link → Attendance Session
  Student Portal  → Identity Registration → QR Enrollment → Attendance Marked
            `,
            technologies: "Python, Streamlit, Streamlit WebRTC, Dlib, face_recognition, Resemblyzer, Librosa, Scikit-learn (SVM/SVC), Supabase PostgreSQL, bcrypt",
            challenges: "Reliably identifying a student from noisy real-time camera and microphone input is non-trivial — lighting variation, background audio, and webcam quality all degrade raw biometric signals. The system addresses this by storing compact, normalised feature embeddings (rather than raw images or audio) in Supabase, and using a trained SVM classifier to map those embeddings to student identities. This keeps the recognition step computationally light and decoupled from the data-capture pipeline."
        },
        gymcoach: {
            title: "AI RealTime Gym Coach",
            category: "Computer Vision / AI",
            overview: "Developed a real-time computer vision fitness coach that analyses human body pose during exercise sessions streamed via webcam. The system detects and evaluates five exercises — Squats, Push-ups, Biceps Curls, Shoulder Presses, and Lunges — using exercise-specific detection logic built on MediaPipe pose landmarks and joint-angle calculations. Rep counts, form analysis, and AI-generated coaching feedback are surfaced in a Streamlit dashboard.",
            architecture: `
  [Webcam Stream]
       |
       v
  [Streamlit WebRTC  →  VideoProcessor]
       |
       v
  [MediaPipe Pose Landmarker]
       |
       v
  [33 Pose Landmarks (x, y, z, visibility)]
       |
       v
  [Exercise Detector  →  Angle / Movement Analysis]
       |
       v
  [Rep Counter + Form Evaluator]
       |
       v
  [Real-Time Metrics displayed on stream]
       |
       v
  [LLM / OpenRouter  →  Coaching Feedback text]
       |
       v
  [gTTS  →  Voice Feedback audio]

  Modular Detector Hierarchy:
  BaseExercise
  ├── SquatDetector
  ├── PushUpDetector
  ├── BicepsCurlDetector
  ├── ShoulderPressDetector
  └── LungesDetector
            `,
            technologies: "Python, MediaPipe Pose Landmarker, OpenCV, Streamlit, Streamlit WebRTC, LLM via OpenRouter, gTTS",
            challenges: "Each exercise has a distinct movement pattern and requires different joint-angle thresholds to classify reps correctly — a single generic rule-set fails across exercise types. The system uses a modular detector architecture where each exercise class inherits from a BaseExercise interface and implements its own angle-calculation and state-machine logic. MediaPipe landmarks are processed per frame, angles are computed between relevant joint triplets, and state transitions (e.g. up → down → up for a squat) drive rep counting without any external timing dependency."
        },
        resumeats: {
            title: "AI Resume ATS Score System",
            category: "NLP / Generative AI",
            overview: "Developed an AI-powered resume analysis platform that evaluates the alignment between a candidate's resume and a target job description. The system extracts structured information from resume PDFs, performs NLP-based skill and keyword extraction, runs semantic similarity matching against the job description, produces an ATS-oriented alignment score, and generates specific, actionable recommendations for closing identified gaps.",
            architecture: `
  [Resume PDF]
       |
       v
  [Text Extraction]
       |
       v
  [NLP Processing via spaCy]
       |
       v
  [Skills / Keywords / Section Identification]
       |
       |          [Job Description Text]
       |                   |
       +------- → [Semantic Analysis]
                           |
                           v
                  [Resume–JD Embedding Matching]
                           |
                           v
                  [ATS Alignment Score + Gap Report]
                           |
                           v
                  [LLM  →  Actionable Recommendations]
                           |
                           v
                  [FastAPI  →  Client / Dashboard]
            `,
            technologies: "Python, FastAPI, spaCy, Sentence Embeddings / Semantic Similarity, LLM via API, Supabase",
            challenges: "Simple keyword frequency matching is a poor proxy for actual job fit — a resume can mention a skill once incidentally and score well, or use semantically equivalent phrasing and score poorly. The system addresses this by combining structured section parsing (spaCy NER and rule-based extraction) with dense embedding similarity between resume and JD representations. Rather than returning only a score, the LLM layer is prompted with the identified gaps to produce targeted, interview-defensible improvement suggestions the candidate can act on immediately."
        },
        adain: {
            title: "Real-Time-Neural-Style-Transfer-with-AdaIN",
            category: "Deep Learning / AI",
            overview: "A deep learning application that performs real-time neural style transfer by matching the mean and variance of content features with style features using Adaptive Instance Normalization (AdaIN).",
            architecture: `
  [Content Image] & [Style Image] ---> [VGG Encoder] ---> [AdaIN Layer] ---> [Decoder] ---> [Stylized Output]
            `,
            technologies: "Python, PyTorch, Torchvision, OpenCV, Deep Learning",
            challenges: "Achieving real-time inference speed while maintaining high-quality stylization. Solved by using the AdaIN layer which efficiently aligns feature statistics without requiring a separate network for every style."
        },
        smartcart: {
            title: "SmartCart-ClusteringSystem",
            category: "Data Science & Machine Learning",
            overview: "An unsupervised machine learning system designed to segment e-commerce customers into distinct clusters based on their purchasing behavior, helping businesses tailor marketing strategies.",
            architecture: `
  [Raw Customer Data] ---> [Data Preprocessing & Scaling] ---> [K-Means / DBSCAN Clustering] ---> [Visual Analytics]
            `,
            technologies: "Python, Scikit-Learn, Pandas, Matplotlib, Seaborn",
            challenges: "Determining the optimal number of clusters for high-dimensional purchase data. Solved by implementing Elbow Method and Silhouette Score analysis to quantitatively evaluate cluster quality."
        },
        creditwise: {
            title: "CreditWise-LoanSystem",
            category: "Machine Learning / Classification",
            overview: "A predictive analytics application that assesses loan approval risk by analyzing applicant financial history and credit metrics using machine learning classification algorithms.",
            architecture: `
  [Applicant Data Input] ---> [Feature Engineering] ---> [Classification Model] ---> [Risk Score & Decision]
            `,
            technologies: "Python, Scikit-Learn, Pandas, Classification Algorithms",
            challenges: "Handling highly imbalanced datasets where default cases were rare. Mitigated by employing SMOTE (Synthetic Minority Over-sampling Technique) to balance the training data."
        },
        sigmagpt: {
            title: "SigmaGPT",
            category: "Full Stack (MERN)",
            overview: "A custom AI assistant application built using the MERN stack, offering a seamless chat interface with robust backend user management and conversation persistence.",
            architecture: `
  [React UI] ---> [Express / Node Server] ---> [MongoDB Database]
            `,
            technologies: "React, Node.js, Express, MongoDB",
            challenges: "Ensuring secure and persistent chat histories for individual users. Handled by implementing secure JWT authentication and a well-structured MongoDB schema to store user sessions."
        },
        weather: {
            title: "weather-app",
            category: "Web Development",
            overview: "A responsive web application that fetches and displays real-time weather forecasts, humidity, wind speed, and other environmental conditions using third-party weather APIs.",
            architecture: `
  [User Location / Search] ---> [Frontend Interface] <--- HTTP GET ---> [Weather API (OpenWeather)]
            `,
            technologies: "HTML, CSS, JavaScript, REST APIs",
            challenges: "Handling asynchronous API responses and potential failures gracefully. Implemented robust error handling and loading states to ensure a smooth user experience."
        },
        chat: {
            title: "Real-Time-Chat-Application",
            category: "Full Stack (MERN)",
            overview: "A full-stack messaging application allowing multiple users to communicate instantly in chat rooms, featuring secure authentication and persistent message history.",
            architecture: `
  [React Frontend] <--- WebSockets ---> [Node.js + Socket.io Server] <---> [MongoDB Database]
            `,
            technologies: "React, Node.js, Express, Socket.io, MongoDB, JWT",
            challenges: "Ensuring real-time bidirectional communication without high server polling overhead. Solved by integrating Socket.io to establish persistent WebSocket connections."
        },
        t5: {
            title: "Fine-Tuned T5 Transformer for Abstractive Text Summarization",
            category: "Natural Language Processing (NLP)",
            overview: "An end-to-end NLP application that automatically generates concise summaries from long texts. Built by fine-tuning the Google T5 (Text-to-Text Transfer Transformer) model on standard summarization datasets and exposing the interface via FastAPI.",
            architecture: `
  [Raw Input Text] ------> [SentenceTokenizer & Preprocess] -------\n                                                           v\n  [Web Client / UI] <---- HTTP REST ----> [FastAPI Endpoint] <---> [Fine-Tuned T5 Model]
            `,
            technologies: "HuggingFace Transformers, PyTorch, Python, FastAPI, Pandas, Jupyter Notebook",
            challenges: "Large input documents exceeded the model's 512-token context window, leading to truncated summaries. Solved this by developing a sliding-window text chunker that summarizes sections individually before running a final synthesis pass."
        },
        yt: {
            title: "Agentic YouTube Video Analyzer",
            category: "Agentic AI / LLMs",
            overview: "An interactive web dashboard that extracts YouTube video transcripts, parses metadata, and structures summaries with timestamps. Driven by an autonomous AI agent layer using GPT models.",
            architecture: `
  [YouTube URL] ---> [Transcript API Engine] ---> [Agno Agent Core] ---> [Streamlit UI Dashboard]\n                                                   |\n                                                   v\n                                         [OpenRouter GPT-4o Mini]
            `,
            technologies: "Python, Streamlit, Agno Framework, OpenRouter/GPT-4o Mini API, YouTube Transcript API",
            challenges: "Videos without manual caption files or with disabled transcripts threw extraction errors. Solved by writing an automated scraper fallback that retrieves auto-generated captions, parses them into blocks, and uses LLM cleaning scripts."
        },
        pa: {
            title: "AI Personal Assistant",
            category: "Artificial Intelligence / Web Integration",
            overview: "A lightweight web assistant that handles Q&A, answers general queries, and provides email summaries. Secured via custom local environment configurations.",
            architecture: `
  [User Client] <---> [Flask Server Controller] <---> [OpenRouter / OpenAI APIs]\n                              |\n                              v\n                [.env Environment Variables]
            `,
            technologies: "Python, Flask, HTML, CSS, JavaScript, OpenRouter API, python-dotenv",
            challenges: "Direct client API calls exposed credentials and security keys. Restructured the codebase to use Flask as an intermediary gateway, storing secrets in backend environment variables and piping sanitised requests to the LLM."
        },
        wander: {
            title: "WanderNest Stay Booking Platform",
            category: "Full Stack (MERN)",
            overview: "A responsive travel stay booking system resembling Airbnb. Users can create accounts, list properties with descriptions and prices, upload photos, and book stays in real time.",
            architecture: `
  [React.js Client] <---> [REST APIs with JWT Header] <---> [Node.js & Express] <---> [MongoDB Database]
            `,
            technologies: "React.js, Node.js, Express.js, MongoDB (Mongoose), JSON Web Tokens (JWT), CSS3",
            challenges: "Unauthenticated requests could compromise user listings and bookings. Implemented JSON Web Token (JWT) verification middleware on the Express backend, protecting all critical CRUD endpoints."
        }
    };

    // Click handler to open modals
    detailButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const projectKey = btn.getAttribute('data-project');
            const data = projectDatabase[projectKey];

            if (data) {
                // Construct detailed layout
                modalInner.innerHTML = `
                    <span class="project-tag ${projectKey === 'wander' ? 'mern-tag' : 'aiml-tag'}">${data.category}</span>
                    <h3>${data.title}</h3>
                    
                    <div class="modal-section">
                        <h4>Project Overview</h4>
                        <p>${data.overview}</p>
                    </div>

                    <div class="modal-section">
                        <h4>System Architecture</h4>
                        <div class="architecture-box">${data.architecture}</div>
                    </div>

                    <div class="modal-section">
                        <h4>Tech Stack</h4>
                        <p>${data.technologies}</p>
                    </div>

                    <div class="modal-section">
                        <h4>Technical Challenge & Solution</h4>
                        <p>${data.challenges}</p>
                    </div>
                `;

                // Open Modal
                modalOverlay.classList.add('open');
                document.body.style.overflow = 'hidden'; // Lock main scroll
            }
        });
    });

    // Close Modal helper
    function closeModal() {
        modalOverlay.classList.remove('open');
        document.body.style.overflow = 'initial'; // Restore scroll
    }

    // Modal Close buttons
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // ESC Key listener to close modal
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
            closeModal();
        }
    });
}
