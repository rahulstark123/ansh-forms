export interface FormFieldTemplate {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[];
}

export interface FormTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  fields: FormFieldTemplate[];
  landingPage: {
    enabled: boolean;
    heroTitle: string;
    heroSubtitle: string;
    faqs: { question: string; answer: string }[];
    contactEmail: string;
    contactPhone: string;
  };
  settings: {
    brandColor: string;
    thankYouTitle: string;
    thankYouMessage: string;
  };
}

export const FORM_TEMPLATES: FormTemplate[] = [
  // ==========================================
  // REGISTRATION & INTAKE (8 templates)
  // ==========================================
  {
    id: "admission",
    title: "School Admission Form",
    category: "Registration",
    description: "Enroll students, register grades, collect birth dates, parent phones, and details.",
    fields: [
      { id: "student_name", type: "text", label: "Student Full Name", placeholder: "Enter student's full name", required: true },
      { id: "dob", type: "date", label: "Date of Birth", placeholder: "", required: true },
      { id: "grade", type: "dropdown", label: "Grade Applying For", placeholder: "Select grade", required: true, options: ["Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"] },
      { id: "parent_name", type: "text", label: "Parent / Guardian Name", placeholder: "Father's or Mother's name", required: true },
      { id: "parent_email", type: "email", label: "Parent Email", placeholder: "parent@example.com", required: true },
      { id: "parent_phone", type: "phone", label: "Parent Phone Number", placeholder: "+91 99999 88888", required: true }
    ],
    landingPage: {
      enabled: true,
      heroTitle: "Academic Admissions 2026-27",
      heroSubtitle: "Register your child for early enrollment. Secure their path to a brighter future.",
      faqs: [
        { question: "What documents are required?", answer: "We require child's birth certificate and parent id proofs." },
        { question: "Is there an entrance screening?", answer: "Yes, a basic screening is conducted for new applicants." }
      ],
      contactEmail: "admissions@anshacademy.edu",
      contactPhone: "+91 11 2345 6789"
    },
    settings: {
      brandColor: "purple",
      thankYouTitle: "Application Received 🎒",
      thankYouMessage: "Thank you for applying. We will contact you for documents verification shortly."
    }
  },
  {
    id: "event_reg",
    title: "Conference Event Registration",
    category: "Registration",
    description: "Collect attendee names, emails, ticket types, and meal preferences.",
    fields: [
      { id: "name", type: "text", label: "Full Name", placeholder: "Enter your full name", required: true },
      { id: "email", type: "email", label: "Email Address", placeholder: "name@example.com", required: true },
      { id: "ticket_type", type: "radio", label: "Ticket Category", placeholder: "", required: true, options: ["General Pass (Free)", "VIP Seat (₹999)", "All-Access Premium (₹2499)"] },
      { id: "meal", type: "dropdown", label: "Meal Preference", placeholder: "Select option", required: false, options: ["Vegetarian", "Non-Vegetarian", "No Meal Needed"] }
    ],
    landingPage: {
      enabled: true,
      heroTitle: "Tech Summit 2026",
      heroSubtitle: "Join the largest tech convergence of the year. Register to reserve your slot.",
      faqs: [
        { question: "Can I transfer my ticket?", answer: "Yes, ticket transfer is available up to 48 hours before the event." },
        { question: "Is parking available at the venue?", answer: "Yes, free parking is available for all registered guests." }
      ],
      contactEmail: "events@anshapps.com",
      contactPhone: "+91 98765 00123"
    },
    settings: {
      brandColor: "emerald",
      thankYouTitle: "Registration Confirmed! 🎉",
      thankYouMessage: "Your ticket has been booked. We have sent the entrance pass QR code to your email."
    }
  },
  {
    id: "waitlist",
    title: "Product Launch Waitlist",
    category: "Registration",
    description: "Generate hype, collect early signs, phone records, and waitlist orders.",
    fields: [
      { id: "name", type: "text", label: "Full Name", placeholder: "Enter your name", required: true },
      { id: "email", type: "email", label: "Email Address", placeholder: "name@example.com", required: true },
      { id: "company", type: "text", label: "Company / Project", placeholder: "Where do you work?", required: false },
      { id: "use_case", type: "dropdown", label: "Primary Use Case", placeholder: "Select an option", required: true, options: ["Personal Use", "Startup / Small Business", "Enterprise Solution", "Agency Builder"] }
    ],
    landingPage: {
      enabled: true,
      heroTitle: "Join the Exclusive Beta",
      heroSubtitle: "Get early access to the next generation of forms and landing page generators.",
      faqs: [
        { question: "When does the beta launch?", answer: "Beta invites will start rolling out in batches from July 2026." },
        { question: "Is the beta free?", answer: "Yes! Beta members receive 3 months of Pro features completely free." }
      ],
      contactEmail: "beta@anshapps.com",
      contactPhone: ""
    },
    settings: {
      brandColor: "ocean",
      thankYouTitle: "You're On The List! 🚀",
      thankYouMessage: "Thank you for registering. You have been placed on our priority beta queue."
    }
  },
  {
    id: "course_enroll",
    title: "Course Enrollment Intake",
    category: "Registration",
    description: "Register students for specific courses and select their timing preferences.",
    fields: [
      { id: "name", type: "text", label: "Student Name", placeholder: "Enter your name", required: true },
      { id: "email", type: "email", label: "Email Address", placeholder: "student@example.com", required: true },
      { id: "course", type: "dropdown", label: "Select Course", placeholder: "Choose course", required: true, options: ["React & Next.js Masterclass", "Database Design & SQL", "UI/UX Principles", "Advanced TypeScript"] },
      { id: "shift", type: "radio", label: "Preferred Batch Timing", placeholder: "", required: true, options: ["Morning (9 AM - 12 PM)", "Afternoon (2 PM - 5 PM)", "Weekend Evening"] }
    ],
    landingPage: {
      enabled: true,
      heroTitle: "Enroll in Professional Courses",
      heroSubtitle: "Level up your developer skill sets. Choose a course and enroll today.",
      faqs: [
        { question: "Are courses recorded?", answer: "Yes, students get lifetime access to all session recordings." },
        { question: "Is there a certificate?", answer: "Yes, certificates are issued upon course project completion." }
      ],
      contactEmail: "education@anshapps.com",
      contactPhone: "+91 99887 76655"
    },
    settings: {
      brandColor: "purple",
      thankYouTitle: "Enrollment Received! 📚",
      thankYouMessage: "Our academic counselor will get in touch with you for class schedule details."
    }
  },
  {
    id: "volunteer",
    title: "Volunteer Sign-up Form",
    category: "Registration",
    description: "Sign up community members for non-profit and social welfare drives.",
    fields: [
      { id: "name", type: "text", label: "Volunteer Name", placeholder: "Enter your name", required: true },
      { id: "phone", type: "phone", label: "Phone Number", placeholder: "+91 ...", required: true },
      { id: "interest", type: "checkbox", label: "Areas of Volunteer Interest", placeholder: "", required: true, options: ["Education & Tutoring", "Environment & Tree Plantation", "Blood Donation Camp", "Disaster Relief Management"] },
      { id: "availability", type: "dropdown", label: "Weekly Availability", placeholder: "Choose availability", required: true, options: ["Weekends only", "Weekdays only", "Flexible hours"] }
    ],
    landingPage: {
      enabled: true,
      heroTitle: "Be the Change: Volunteer",
      heroSubtitle: "Help make the community a better place. Your contribution matters.",
      faqs: [
        { question: "What is the minimum age?", answer: "Volunteers must be at least 16 years of age." },
        { question: "Is there a training session?", answer: "Yes, we host a brief orientation call before each campaign." }
      ],
      contactEmail: "ngo@anshapps.com",
      contactPhone: ""
    },
    settings: {
      brandColor: "emerald",
      thankYouTitle: "Welcome Aboard! 🤝",
      thankYouMessage: "Thank you for volunteering. We will add you to our coordinator WhatsApp group."
    }
  },
  {
    id: "membership",
    title: "Gym Membership Application",
    category: "Registration",
    description: "Capture personal info, fitness goals, and membership plan selection.",
    fields: [
      { id: "name", type: "text", label: "Member Name", placeholder: "Enter name", required: true },
      { id: "email", type: "email", label: "Email Address", placeholder: "name@example.com", required: true },
      { id: "plan", type: "radio", label: "Select Membership Plan", placeholder: "", required: true, options: ["Monthly Starter (₹1,500)", "Quarterly Value (₹3,800)", "Annual Premium (₹12,000)"] },
      { id: "goals", type: "checkbox", label: "Your Fitness Goals", placeholder: "", required: false, options: ["Weight Loss", "Muscle Gain", "Cardio Endurance", "General Wellness"] }
    ],
    landingPage: {
      enabled: true,
      heroTitle: "Elite Fitness Club Membership",
      heroSubtitle: "Kickstart your fitness transformation journey. Sign up now and get a free personal training slot.",
      faqs: [
        { question: "Are showers available?", answer: "Yes, showers, locker rooms, and changing rooms are available." },
        { question: "What are gym timings?", answer: "We are open daily from 5:00 AM to 10:00 PM." }
      ],
      contactEmail: "gym@anshapps.com",
      contactPhone: ""
    },
    settings: {
      brandColor: "amber",
      thankYouTitle: "Membership Booked! 🏋️",
      thankYouMessage: "Your registration is logged. Please visit the gym front desk to collect your access card."
    }
  },
  {
    id: "camp_signup",
    title: "Summer Camp Sign-up",
    category: "Registration",
    description: "Register children for summer camp activities, tracking age and allergy warnings.",
    fields: [
      { id: "parent_name", type: "text", label: "Parent Name", placeholder: "Enter parent name", required: true },
      { id: "child_name", type: "text", label: "Child Name", placeholder: "Enter child's name", required: true },
      { id: "child_age", type: "number", label: "Child's Age", placeholder: "Enter child's age", required: true },
      { id: "allergies", type: "textarea", label: "Medical / Allergy Declarations", placeholder: "Mention details, or write None...", required: false }
    ],
    landingPage: {
      enabled: false,
      heroTitle: "Camp Adventure 2026",
      heroSubtitle: "Give your child a summer of fun, learning, and outdoor activities.",
      faqs: [],
      contactEmail: "camp@anshapps.com",
      contactPhone: ""
    },
    settings: {
      brandColor: "amber",
      thankYouTitle: "Camp Slot Reserved!",
      thankYouMessage: "We've registered your child for Camp Adventure. The schedule details have been sent to your email."
    }
  },
  {
    id: "webinar",
    title: "Webinar Registration",
    category: "Registration",
    description: "Sign up attendees for live webinars, tracking business backgrounds.",
    fields: [
      { id: "name", type: "text", label: "Full Name", placeholder: "Enter full name", required: true },
      { id: "email", type: "email", label: "Email Address", placeholder: "name@example.com", required: true },
      { id: "experience", type: "dropdown", label: "Current Professional Level", placeholder: "Choose level", required: true, options: ["Student / Fresher", "Junior Developer", "Senior Engineer / Tech Lead", "Founder / Tech Executive"] }
    ],
    landingPage: {
      enabled: true,
      heroTitle: "Mastering Next.js 16 Webinar",
      heroSubtitle: "Learn how to build production-grade web systems in Next.js 16. Host: Rahul Ansh.",
      faqs: [
        { question: "Is this event live?", answer: "Yes, this will be a live interactive webinar with Q&A." },
        { question: "Will we get slides?", answer: "Yes, slides and Github repos will be shared with registered attendees." }
      ],
      contactEmail: "webinar@anshapps.com",
      contactPhone: ""
    },
    settings: {
      brandColor: "ocean",
      thankYouTitle: "Webinar Slot Reserved! 🎟️",
      thankYouMessage: "You're registered. The Zoom webinar join link has been emailed to you."
    }
  },

  // ==========================================
  // FEEDBACK & SURVEYS (8 templates)
  // ==========================================
  {
    id: "feedback",
    title: "Customer Feedback Survey",
    category: "Feedback",
    description: "Measure customer satisfaction, rating levels, and text testimonials.",
    fields: [
      { id: "name", type: "text", label: "Name (Optional)", placeholder: "Enter your name", required: false },
      { id: "rating", type: "rating", label: "Rate Your Overall Experience", placeholder: "", required: true },
      { id: "recommend", type: "radio", label: "Would you recommend our product?", placeholder: "", required: true, options: ["Yes, absolutely", "Maybe, unsure", "No, unlikely"] },
      { id: "comments", type: "textarea", label: "Additional Feedback", placeholder: "Help us improve by leaving your comments here...", required: false }
    ],
    landingPage: {
      enabled: false,
      heroTitle: "Share Your Experience",
      heroSubtitle: "Your feedback shapes our product decisions. Let us know how we did!",
      faqs: [],
      contactEmail: "product@anshapps.com",
      contactPhone: ""
    },
    settings: {
      brandColor: "amber",
      thankYouTitle: "Feedback Submitted!",
      thankYouMessage: "We deeply appreciate you taking the time to share your feedback. Have a wonderful day!"
    }
  },
  {
    id: "employee_sat",
    title: "Employee Satisfaction Survey",
    category: "Feedback",
    description: "Internal survey to check workplace environment, balance, and reviews.",
    fields: [
      { id: "dept", type: "dropdown", label: "Your Department", placeholder: "Choose department", required: true, options: ["Engineering", "Product & Design", "Marketing & Sales", "Operations & HR"] },
      { id: "rating", type: "rating", label: "Rate Workplace Culture & Environment", placeholder: "", required: true },
      { id: "work_life", type: "radio", label: "Do you have a healthy Work-Life Balance?", placeholder: "", required: true, options: ["Yes, very much", "Sometimes, average", "No, feeling burnt out"] },
      { id: "feedback", type: "textarea", label: "What can HR improve?", placeholder: "Write anonymous comments here...", required: false }
    ],
    landingPage: {
      enabled: false,
      heroTitle: "Workplace Improvement Survey",
      heroSubtitle: "Please fill out this internal evaluation.",
      faqs: [],
      contactEmail: "",
      contactPhone: ""
    },
    settings: {
      brandColor: "purple",
      thankYouTitle: "Thank You!",
      thankYouMessage: "Your survey inputs have been anonymously recorded to improve our office culture."
    }
  },
  {
    id: "event_feedback",
    title: "Event Feedback Survey",
    category: "Feedback",
    description: "Capture event reviews, speaker ratings, and logistics opinions.",
    fields: [
      { id: "rating", type: "rating", label: "Rate the Event Overall", placeholder: "", required: true },
      { id: "favorite", type: "text", label: "What was your favorite session / speaker?", placeholder: "Session name...", required: true },
      { id: "logistics", type: "dropdown", label: "Food & Venue Quality", placeholder: "Rate quality", required: true, options: ["Excellent", "Good / Satisfactory", "Needs Improvement"] },
      { id: "suggestions", type: "textarea", label: "Suggestions for Next Year", placeholder: "Write here...", required: false }
    ],
    landingPage: {
      enabled: false,
      heroTitle: "Tech Summit Review",
      heroSubtitle: "Let us know your thoughts to help us organize better next time.",
      faqs: [],
      contactEmail: "",
      contactPhone: ""
    },
    settings: {
      brandColor: "emerald",
      thankYouTitle: "Feedback Logged!",
      thankYouMessage: "Thank you for attending the summit and sharing your inputs."
    }
  },
  {
    id: "product_market",
    title: "Product Market Fit Survey",
    category: "Feedback",
    description: "Understand user retention and alternative choices if product goes offline.",
    fields: [
      { id: "disappoint", type: "radio", label: "How would you feel if you could no longer use this product?", placeholder: "", required: true, options: ["Very disappointed", "Somewhat disappointed", "Not disappointed", "I no longer use it"] },
      { id: "benefit", type: "textarea", label: "What is the primary benefit you get from our tool?", placeholder: "Describe key benefit...", required: true },
      { id: "alternative", type: "dropdown", label: "What alternative would you use?", placeholder: "Choose option", required: true, options: ["Typeform / Google Forms", "Jotform", "Custom build internal codebase", "None, I wouldn't build forms"] }
    ],
    landingPage: {
      enabled: false,
      heroTitle: "PMF Evaluation",
      heroSubtitle: "Help us study user sentiment.",
      faqs: [],
      contactEmail: "",
      contactPhone: ""
    },
    settings: {
      brandColor: "ocean",
      thankYouTitle: "Thank You!",
      thankYouMessage: "Your comments help us optimize features."
    }
  },
  {
    id: "course_eval",
    title: "Course Evaluation Survey",
    category: "Feedback",
    description: "Collect ratings for instructors, materials, and learning speed.",
    fields: [
      { id: "instructor_rating", type: "rating", label: "Rate Instructor's Teaching Style", placeholder: "", required: true },
      { id: "pace", type: "radio", label: "The pace of the class was:", placeholder: "", required: true, options: ["Too Fast", "Just Right", "Too Slow"] },
      { id: "difficulty", type: "dropdown", label: "Course Content Difficulty", placeholder: "Select option", required: true, options: ["Too Beginner", "Practical & Balanced", "Highly Advanced / Difficult"] },
      { id: "reviews", type: "textarea", label: "General Comments / Reviews", placeholder: "Write here...", required: false }
    ],
    landingPage: {
      enabled: false,
      heroTitle: "Course Review Form",
      heroSubtitle: "Give feedback on your class experience.",
      faqs: [],
      contactEmail: "",
      contactPhone: ""
    },
    settings: {
      brandColor: "purple",
      thankYouTitle: "Evaluation Submitted!",
      thankYouMessage: "We will use your review to fine tune future cohorts."
    }
  },
  {
    id: "website_feedback",
    title: "Website Feedback Form",
    category: "Feedback",
    description: "Report bugs, UI issues, or request site features.",
    fields: [
      { id: "page_url", type: "text", label: "Page URL with Issue", placeholder: "https://your-domain.com/broken-page", required: true },
      { id: "issue_type", type: "dropdown", label: "Select Feedback Type", placeholder: "Choose type", required: true, options: ["Visual Bug / Layout broken", "Performance Lag / Slow load", "Feature Request", "Grammar Error / Typo"] },
      { id: "details", type: "textarea", label: "Detailed Description", placeholder: "Describe what went wrong and steps to reproduce...", required: true }
    ],
    landingPage: {
      enabled: false,
      heroTitle: "Website Bug Reporting",
      heroSubtitle: "Help us keep the website clean and fast. Submit issues here.",
      faqs: [],
      contactEmail: "",
      contactPhone: ""
    },
    settings: {
      brandColor: "emerald",
      thankYouTitle: "Bug Report Received!",
      thankYouMessage: "Thank you for the notification. Our developers will inspect this issue soon."
    }
  },
  {
    id: "nps",
    title: "Net Promoter Score Survey",
    category: "Feedback",
    description: "Calculate standard company referral rating index.",
    fields: [
      { id: "nps_score", type: "radio", label: "How likely are you to recommend us to a colleague (0-10)?", placeholder: "", required: true, options: ["0-2 (Extremely Unlikely)", "3-6 (Unlikely / Detractor)", "7-8 (Neutral / Passive)", "9-10 (Extremely Likely / Promoter)"] },
      { id: "reason", type: "textarea", label: "What is the primary reason for your score?", placeholder: "Write reason...", required: true }
    ],
    landingPage: {
      enabled: false,
      heroTitle: "Net Promoter Score (NPS)",
      heroSubtitle: "Let us know what you think.",
      faqs: [],
      contactEmail: "",
      contactPhone: ""
    },
    settings: {
      brandColor: "ocean",
      thankYouTitle: "Score Submitted!",
      thankYouMessage: "Your score has been logged. Thank you for helping us grow!"
    }
  },
  {
    id: "service_rating",
    title: "Customer Support Service Rating",
    category: "Feedback",
    description: "Evaluate support representatives, resolve times, and speed.",
    fields: [
      { id: "rep_name", type: "text", label: "Support Ticket ID or Agent Name", placeholder: "Agent name or ID...", required: true },
      { id: "rating", type: "rating", label: "Rate Agent Friendliness & Resolution Quality", placeholder: "", required: true },
      { id: "resolved", type: "radio", label: "Was your issue resolved successfully?", placeholder: "", required: true, options: ["Yes, completely", "Partially", "No, still broken"] }
    ],
    landingPage: {
      enabled: false,
      heroTitle: "Support Service Rating",
      heroSubtitle: "Tell us how our support team performed on your ticket.",
      faqs: [],
      contactEmail: "",
      contactPhone: ""
    },
    settings: {
      brandColor: "purple",
      thankYouTitle: "Feedback Submitted!",
      thankYouMessage: "Your support score is saved. We appreciate your input!"
    }
  },

  // ==========================================
  // LEAD GENERATION (8 templates)
  // ==========================================
  {
    id: "contact",
    title: "Simple Contact Form",
    category: "Lead Gen",
    description: "Collect general inquiries, messages, and feedback from website visitors.",
    fields: [
      { id: "name", type: "text", label: "Full Name", placeholder: "Enter your full name", required: true },
      { id: "email", type: "email", label: "Email Address", placeholder: "name@example.com", required: true },
      { id: "subject", type: "text", label: "Subject", placeholder: "What is this inquiry about?", required: false },
      { id: "message", type: "textarea", label: "Message / Inquiry", placeholder: "Describe your message in detail...", required: true }
    ],
    landingPage: {
      enabled: true,
      heroTitle: "Contact Our Team",
      heroSubtitle: "Have questions? Fill out the form below and we will get back to you within 24 hours.",
      faqs: [
        { question: "What are your support hours?", answer: "Our team operates Monday through Friday, 9:00 AM to 6:00 PM IST." },
        { question: "How quickly do you respond?", answer: "We aim to answer all inquiries within one business day." }
      ],
      contactEmail: "support@anshapps.com",
      contactPhone: "+91 98765 43210"
    },
    settings: {
      brandColor: "emerald",
      thankYouTitle: "Thank You!",
      thankYouMessage: "Your message has been received. Our team will contact you shortly."
    }
  },
  {
    id: "newsletter",
    title: "Newsletter Subscription",
    category: "Lead Gen",
    description: "Build an email list and newsletter audience updates.",
    fields: [
      { id: "email", type: "email", label: "Email Address", placeholder: "name@example.com", required: true },
      { id: "interests", type: "checkbox", label: "Select Newsletter Topics", placeholder: "", required: false, options: ["Weekly Tech Digest", "Product & Feature Releases", "UI Design Inspiration", "Special Discounts & Offers"] }
    ],
    landingPage: {
      enabled: true,
      heroTitle: "Subscribe to Our Newsletter",
      heroSubtitle: "Join 10,000+ developers getting our weekly insights. No spam, unsubscribe anytime.",
      faqs: [
        { question: "How often do you send emails?", answer: "We send one newsletter every Tuesday morning." }
      ],
      contactEmail: "newsletter@anshapps.com",
      contactPhone: ""
    },
    settings: {
      brandColor: "ocean",
      thankYouTitle: "Welcome to the Club! 📬",
      thankYouMessage: "You've subscribed successfully. Check your inbox for the welcome bonus ebook link!"
    }
  },
  {
    id: "quote_req",
    title: "Request a Quote",
    category: "Lead Gen",
    description: "Capture client budgets, project size, and spec details.",
    fields: [
      { id: "name", type: "text", label: "Client Name", placeholder: "Enter name", required: true },
      { id: "company", type: "text", label: "Company Name", placeholder: "Enter company", required: true },
      { id: "budget", type: "dropdown", label: "Project Budget", placeholder: "Select range", required: true, options: ["Under ₹50,000", "₹50,000 - ₹2,00,050", "₹2,00,000 - ₹5,00,000", "₹5,00,000+"] },
      { id: "timeline", type: "radio", label: "Project Timeline", placeholder: "", required: true, options: ["ASAP (Under 2 weeks)", "1-2 months", "Flexible timeline"] },
      { id: "requirements", type: "textarea", label: "Project Brief / Requirements", placeholder: "Describe what you need built...", required: true }
    ],
    landingPage: {
      enabled: true,
      heroTitle: "Get a Custom Project Quote",
      heroSubtitle: "Let's build something remarkable together. Share your requirements for a free cost estimate.",
      faqs: [
        { question: "How long does the proposal take?", answer: "We supply a detailed project breakdown within 2 business days." }
      ],
      contactEmail: "sales@anshapps.com",
      contactPhone: ""
    },
    settings: {
      brandColor: "purple",
      thankYouTitle: "Quote Request Received!",
      thankYouMessage: "Thank you. Our solutions architect will review your project brief and schedule a call."
    }
  },
  {
    id: "demo_book",
    title: "Book a Product Demo",
    category: "Lead Gen",
    description: "Collect company size details and schedule 1-on-1 demos.",
    fields: [
      { id: "name", type: "text", label: "Full Name", placeholder: "Enter name", required: true },
      { id: "email", type: "email", label: "Work Email", placeholder: "you@company.com", required: true },
      { id: "size", type: "dropdown", label: "Company Size", placeholder: "Choose size", required: true, options: ["1-10 employees", "11-50 employees", "51-200 employees", "200+ employees"] },
      { id: "date", type: "date", label: "Preferred Demo Date", placeholder: "", required: true }
    ],
    landingPage: {
      enabled: true,
      heroTitle: "Schedule a Live Demo",
      heroSubtitle: "See how ANSH Forms can help automate your data pipelines and increase conversion rates by 40%.",
      faqs: [
        { question: "How long is the demo?", answer: "Our standard tour takes 15 minutes, followed by a Q&A session." }
      ],
      contactEmail: "demo@anshapps.com",
      contactPhone: ""
    },
    settings: {
      brandColor: "emerald",
      thankYouTitle: "Demo Request Logged!",
      thankYouMessage: "We've received your request. We will email you a calendar invite shortly."
    }
  },
  {
    id: "ebook_download",
    title: "Ebook Download Intake",
    category: "Lead Gen",
    description: "Offer a free ebook PDF and capture leads in exchange.",
    fields: [
      { id: "name", type: "text", label: "Name", placeholder: "Enter name", required: true },
      { id: "email", type: "email", label: "Email Address", placeholder: "name@example.com", required: true },
      { id: "role", type: "dropdown", label: "Your Role", placeholder: "Select role", required: true, options: ["Frontend Developer", "Designer", "Product Manager", "Student"] }
    ],
    landingPage: {
      enabled: true,
      heroTitle: "Download: Next.js Architecture Ebook",
      heroSubtitle: "Get our comprehensive guide on building scalable, search optimized layouts in React 19.",
      faqs: [],
      contactEmail: "",
      contactPhone: ""
    },
    settings: {
      brandColor: "ocean",
      thankYouTitle: "Ebook Sent! 📚",
      thankYouMessage: "Thank you! We have sent the download link for the PDF to your email."
    }
  },
  {
    id: "partner_app",
    title: "Partner Program Application",
    category: "Lead Gen",
    description: "Register affiliates, resellers, or software partners.",
    fields: [
      { id: "name", type: "text", label: "Contact Person", placeholder: "Enter your name", required: true },
      { id: "website", type: "text", label: "Agency / Partner Website", placeholder: "https://partner.com", required: true },
      { id: "type", type: "dropdown", label: "Partnership Type", placeholder: "Select type", required: true, options: ["Affiliate Promoter", "Reseller / Integrator", "Consulting Agency", "Other"] },
      { id: "strategy", type: "textarea", label: "How do you plan to promote us?", placeholder: "Describe marketing channels...", required: false }
    ],
    landingPage: {
      enabled: true,
      heroTitle: "Partner with ANSH Forms",
      heroSubtitle: "Earn up to 30% recurring commission on client sales referrals.",
      faqs: [
        { question: "When are commissions paid?", answer: "Commissions are paid monthly on the 10th via bank transfer." }
      ],
      contactEmail: "partners@anshapps.com",
      contactPhone: ""
    },
    settings: {
      brandColor: "purple",
      thankYouTitle: "Application Submitted!",
      thankYouMessage: "Our partnership manager will review your website and contact you within 3 business days."
    }
  },
  {
    id: "callback",
    title: "Request a Callback",
    category: "Lead Gen",
    description: "Capture phone numbers and timing preference for a callback.",
    fields: [
      { id: "name", type: "text", label: "Name", placeholder: "Enter name", required: true },
      { id: "phone", type: "phone", label: "Phone Number", placeholder: "+91 ...", required: true },
      { id: "time", type: "dropdown", label: "Best Time to Call", placeholder: "Select slot", required: true, options: ["Morning (9 AM - 12 PM)", "Afternoon (12 PM - 4 PM)", "Evening (4 PM - 7 PM)"] }
    ],
    landingPage: {
      enabled: false,
      heroTitle: "Request Support Callback",
      heroSubtitle: "Rather speak to a human? Request a call.",
      faqs: [],
      contactEmail: "",
      contactPhone: ""
    },
    settings: {
      brandColor: "amber",
      thankYouTitle: "Callback Requested!",
      thankYouMessage: "We have queued your phone. An agent will call you during your selected time slot."
    }
  },
  {
    id: "contest",
    title: "Contest / Giveaway Entry",
    category: "Lead Gen",
    description: "Run giveaways, collect social handles and entry confirmation.",
    fields: [
      { id: "name", type: "text", label: "Name", placeholder: "Enter name", required: true },
      { id: "email", type: "email", label: "Email Address", placeholder: "name@example.com", required: true },
      { id: "handle", type: "text", label: "Twitter / Instagram Handle", placeholder: "@yourname", required: true },
      { id: "agree", type: "checkbox", label: "Terms Agreement", placeholder: "", required: true, options: ["I agree to the Giveaway rules and conditions"] }
    ],
    landingPage: {
      enabled: true,
      heroTitle: "Win a Free Pro Subscription",
      heroSubtitle: "Enter our weekly giveaway sweepstakes to win one full year of ANSH Forms Pro.",
      faqs: [
        { question: "How are winners notified?", answer: "Winners are emailed directly and announced on Twitter." }
      ],
      contactEmail: "contest@anshapps.com",
      contactPhone: ""
    },
    settings: {
      brandColor: "emerald",
      thankYouTitle: "Entry Confirmed! 🍀",
      thankYouMessage: "You're successfully entered in the contest. Best of luck!"
    }
  },

  // ==========================================
  // BUSINESS & OPERATIONS (8 templates)
  // ==========================================
  {
    id: "job_app",
    title: "Job Application",
    category: "Operations",
    description: "Upload resume PDF files, register roles, portfolios, and phone details.",
    fields: [
      { id: "name", type: "text", label: "Full Name", placeholder: "Enter name", required: true },
      { id: "email", type: "email", label: "Email Address", placeholder: "name@example.com", required: true },
      { id: "phone", type: "phone", label: "Phone Number", placeholder: "+91 ...", required: true },
      { id: "role", type: "dropdown", label: "Applying Role", placeholder: "Select role", required: true, options: ["Frontend Engineer", "Backend Developer", "Product Designer", "Operations Executive"] },
      { id: "portfolio", type: "text", label: "Portfolio URL Link", placeholder: "https://yourportfolio.com", required: false },
      { id: "resume", type: "file", label: "Upload Resume PDF", placeholder: "", required: true }
    ],
    landingPage: {
      enabled: true,
      heroTitle: "Careers at ANSH",
      heroSubtitle: "We are always looking for passionate builders. Apply below for open roles.",
      faqs: [
        { question: "Do you offer remote work?", answer: "Yes, we support flexible hybrid and full-remote schedules." }
      ],
      contactEmail: "careers@anshapps.com",
      contactPhone: ""
    },
    settings: {
      brandColor: "purple",
      thankYouTitle: "Application Submitted! 📁",
      thankYouMessage: "Thank you for applying. If your resume matches our criteria, our HR recruiter will email you for next interview steps."
    }
  },
  {
    id: "expense_report",
    title: "Travel Expense Claim",
    category: "Operations",
    description: "Internal operations form to claim food, travel, and accommodation expenses.",
    fields: [
      { id: "employee_id", type: "text", label: "Employee ID", placeholder: "E-1025...", required: true },
      { id: "trip_name", type: "text", label: "Purpose of Travel / Trip", placeholder: "Client meeting, Conference name...", required: true },
      { id: "amount", type: "number", label: "Total Claim Amount (INR)", placeholder: "Enter total value", required: true },
      { id: "category", type: "dropdown", label: "Expense Category", placeholder: "Choose category", required: true, options: ["Flight / Train Tickets", "Hotel Accommodation", "Meal / Dinner", "Taxi / Local Commute"] },
      { id: "receipts", type: "file", label: "Upload Bills PDF / Zip", placeholder: "", required: true }
    ],
    landingPage: {
      enabled: false,
      heroTitle: "Corporate Expense Reimbursements",
      heroSubtitle: "Please submit all official receipts for processing.",
      faqs: [],
      contactEmail: "",
      contactPhone: ""
    },
    settings: {
      brandColor: "amber",
      thankYouTitle: "Claim Logged!",
      thankYouMessage: "Your travel claim has been sent to the accounts department for audit approval."
    }
  },
  {
    id: "time_off",
    title: "Time Off Request",
    category: "Operations",
    description: "Request sick leave, casual leave, or privilege leaves.",
    fields: [
      { id: "emp_name", type: "text", label: "Employee Name", placeholder: "Enter name", required: true },
      { id: "type", type: "radio", label: "Leave Category", placeholder: "", required: true, options: ["Casual Leave", "Sick Leave", "Privilege / Earned Leave", "Maternity / Paternity"] },
      { id: "start_date", type: "date", label: "Leave Start Date", placeholder: "", required: true },
      { id: "end_date", type: "date", label: "Leave End Date", placeholder: "", required: true },
      { id: "reason", type: "textarea", label: "Reason for Time Off", placeholder: "Brief reason...", required: true }
    ],
    landingPage: {
      enabled: false,
      heroTitle: "Employee Leave Portal",
      heroSubtitle: "Register leaves in advance.",
      faqs: [],
      contactEmail: "",
      contactPhone: ""
    },
    settings: {
      brandColor: "ocean",
      thankYouTitle: "Leave Request Submitted!",
      thankYouMessage: "Your leave has been sent to your supervisor/manager for approval."
    }
  },
  {
    id: "it_ticket",
    title: "IT Support Request Ticket",
    category: "Operations",
    description: "Submit hardware, software, or network issues to office IT.",
    fields: [
      { id: "device", type: "dropdown", label: "Issue Device / System", placeholder: "Choose system", required: true, options: ["Office Macbook / Laptop", "Office Wifi / Internet", "VPN Access credentials", "Slack / Email accounts"] },
      { id: "priority", type: "radio", label: "Urgency / Priority", placeholder: "", required: true, options: ["Low (Non-blocking)", "Medium (Partial block)", "High (Complete block / Urgent)"] },
      { id: "description", type: "textarea", label: "Describe IT Issue", placeholder: "Explain issue details...", required: true }
    ],
    landingPage: {
      enabled: false,
      heroTitle: "IT Support Portal",
      heroSubtitle: "Helpdesk support ticket submit page.",
      faqs: [],
      contactEmail: "",
      contactPhone: ""
    },
    settings: {
      brandColor: "purple",
      thankYouTitle: "Ticket Raised!",
      thankYouMessage: "Your ticket has been logged. An IT admin representative will visit your desk shortly."
    }
  },
  {
    id: "purchase_order",
    title: "Purchase Order Intake",
    category: "Operations",
    description: "Requisition items, inventory, or materials from vendors.",
    fields: [
      { id: "dept", type: "dropdown", label: "Requesting Department", placeholder: "Select department", required: true, options: ["Administration & Facilities", "Engineering", "Marketing / Brand assets", "HR Team"] },
      { id: "items", type: "textarea", label: "Item Description & Quantity", placeholder: "10x Office Chairs, 2x Whiteboards...", required: true },
      { id: "amount_estimate", type: "number", label: "Estimated Cost (₹)", placeholder: "Enter estimate", required: true }
    ],
    landingPage: {
      enabled: false,
      heroTitle: "Office Purchase Orders",
      heroSubtitle: "Submit inventory requirements.",
      faqs: [],
      contactEmail: "",
      contactPhone: ""
    },
    settings: {
      brandColor: "emerald",
      thankYouTitle: "Requisition Logged!",
      thankYouMessage: "Purchase request sent to procurement managers for balance approvals."
    }
  },
  {
    id: "client_onboard",
    title: "Client Onboarding Form",
    category: "Operations",
    description: "Onboard new agency clients, tracking brand details and assets.",
    fields: [
      { id: "brand", type: "text", label: "Brand Name", placeholder: "Enter brand name", required: true },
      { id: "primary_contact", type: "text", label: "Primary Contact Person", placeholder: "Name...", required: true },
      { id: "socials", type: "textarea", label: "Social Media / Website Handles", placeholder: "Links...", required: false },
      { id: "brand_guide", type: "file", label: "Upload Brand Guidelines / Assets Zip", placeholder: "", required: false }
    ],
    landingPage: {
      enabled: false,
      heroTitle: "New Client Intake",
      heroSubtitle: "Provide brand details to kickstart our campaign collaboration.",
      faqs: [],
      contactEmail: "",
      contactPhone: ""
    },
    settings: {
      brandColor: "ocean",
      thankYouTitle: "Welcome Aboard!",
      thankYouMessage: "Brand details saved. We have scheduled our kickoff meeting call!"
    }
  },
  {
    id: "equipment_req",
    title: "Equipment Request Form",
    category: "Operations",
    description: "Claim company laptops, monitors, or desks for work from home.",
    fields: [
      { id: "name", type: "Employee Name", label: "Name", placeholder: "Enter name", required: true },
      { id: "equipment", type: "checkbox", label: "Equipment Required", placeholder: "", required: true, options: ["External Monitor", "Ergonomic Office Chair", "Keyboard & Mouse combo", "Noise-cancelling Headphones"] },
      { id: "address", type: "textarea", label: "Shipping Address for Delivery", placeholder: "Enter complete home address...", required: true }
    ],
    landingPage: {
      enabled: false,
      heroTitle: "WFH Equipment Portal",
      heroSubtitle: "Claim official hardware peripherals.",
      faqs: [],
      contactEmail: "",
      contactPhone: ""
    },
    settings: {
      brandColor: "amber",
      thankYouTitle: "Request Received!",
      thankYouMessage: "Your shipping request is approved. Courier tracking details will follow."
    }
  },
  {
    id: "vendor_reg",
    title: "Vendor Registration Form",
    category: "Operations",
    description: "Collect company registration, tax PAN/GST, and bank details from suppliers.",
    fields: [
      { id: "vendor_name", type: "text", label: "Vendor Company Name", placeholder: "Company name...", required: true },
      { id: "gst", type: "text", label: "GSTIN Number", placeholder: "GST registration ID...", required: true },
      { id: "bank_details", type: "textarea", label: "Bank Account Details", placeholder: "Account Name, A/c Number, IFSC Code...", required: true },
      { id: "pan_card", type: "file", label: "Upload PAN Card / GST PDF", placeholder: "", required: true }
    ],
    landingPage: {
      enabled: false,
      heroTitle: "Vendor Onboarding",
      heroSubtitle: "Register supplier details for accounts payable setup.",
      faqs: [],
      contactEmail: "",
      contactPhone: ""
    },
    settings: {
      brandColor: "emerald",
      thankYouTitle: "Vendor Registered!",
      thankYouMessage: "Your details have been recorded. You are now added to our active supplier directories."
    }
  }
];
