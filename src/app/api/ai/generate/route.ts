import { NextResponse } from "next/server";

// Fallback keyword matcher database
const LOCAL_TEMPLATES: Record<string, any> = {
  admission: {
    title: "School Admission Portal",
    description: "Register student details, dates of birth, grade preferences, parent contacts.",
    fields: [
      { id: "student_name", type: "text", label: "Student Full Name", placeholder: "Enter student name", required: true },
      { id: "dob", type: "date", label: "Date of Birth", placeholder: "", required: true },
      { id: "grade", type: "dropdown", label: "Grade Choice", placeholder: "Select grade level", required: true, options: ["Grade 1", "Grade 2", "Grade 3", "Grade 4"] },
      { id: "parent_name", type: "text", label: "Parent Name", placeholder: "Father's or Mother's name", required: true },
      { id: "parent_phone", type: "phone", label: "Parent Phone Number", placeholder: "Phone", required: true },
      { id: "prev_school", type: "text", label: "Previous School Name", placeholder: "Specify school name", required: false }
    ],
    landingPage: {
      enabled: true,
      heroTitle: "Academic Admissions 2026",
      heroSubtitle: "Submit child registration details for active verification review.",
      faqs: [
        { question: "What files are required?", answer: "We require child birth certificates, previous transcripts, and parent ID proofs." }
      ],
      contactEmail: "admissions@school.edu",
      contactPhone: "+91 11 2345 6789"
    },
    settings: { brandColor: "purple", thankYouTitle: "Application Received!", thankYouMessage: "We have logged your application. We will contact you soon." }
  },
  job: {
    title: "Job Application Form",
    description: "Collect applicant resumes, details, portfolios, and job roles.",
    fields: [
      { id: "name", type: "text", label: "Full Name", placeholder: "Enter your name", required: true },
      { id: "email", type: "email", label: "Email Address", placeholder: "name@example.com", required: true },
      { id: "role", type: "dropdown", label: "Role Applying For", placeholder: "Select position", required: true, options: ["Software Engineer", "UI/UX Designer", "Product Manager", "Data Analyst"] },
      { id: "resume", type: "file", label: "Upload Resume (PDF)", placeholder: "", required: true },
      { id: "portfolio", type: "text", label: "Portfolio / LinkedIn URL", placeholder: "https://...", required: false },
      { id: "signature", type: "signature", label: "Applicant Signature Verification", placeholder: "", required: true }
    ],
    landingPage: {
      enabled: true,
      heroTitle: "Careers at ANSH",
      heroSubtitle: "Join our high-performance team. Submit details and resume files below.",
      faqs: [
        { question: "Do you support remote work?", answer: "Yes, we operate on a hybrid system offering flexible schedules." }
      ],
      contactEmail: "careers@anshapps.com",
      contactPhone: ""
    },
    settings: { brandColor: "emerald", thankYouTitle: "Application Submitted!", thankYouMessage: "Thank you for applying. We will review your resume portfolio and contact you for interviews." }
  },
  waitlist: {
    title: "Launch Beta Waitlist",
    description: "Secure priority invitations to early beta features releases.",
    fields: [
      { id: "name", type: "text", label: "Name", placeholder: "Enter your name", required: true },
      { id: "email", type: "email", label: "Email Address", placeholder: "name@example.com", required: true },
      { id: "role", type: "dropdown", label: "Primary Role", placeholder: "Select role", required: true, options: ["Software Developer", "Product Manager", "Designer", "Business Owner"] }
    ],
    landingPage: {
      enabled: true,
      heroTitle: "Join the Exclusive Beta Waitlist",
      heroSubtitle: "Get early access to our next generation of forms builder tools. Priority queue is limited.",
      faqs: [
        { question: "Is beta free?", answer: "Yes, beta members get 3 months of premium features for free." }
      ],
      contactEmail: "waitlist@anshapps.com",
      contactPhone: ""
    },
    settings: { brandColor: "ocean", thankYouTitle: "You're On The List!", thankYouMessage: "We have priority queue locked. We will email you once batch invites release." }
  },
  feedback: {
    title: "Customer Satisfaction Survey",
    description: "Help us calibrate our products and features using satisfaction ratings.",
    fields: [
      { id: "name", type: "text", label: "Name (Optional)", placeholder: "Name", required: false },
      { id: "rating", type: "rating", label: "Rate Overall Experience", placeholder: "", required: true },
      { id: "recommend", type: "radio", label: "Would you recommend us?", placeholder: "", required: true, options: ["Yes, absolutely", "Unsure", "No, unlikely"] },
      { id: "comments", type: "textarea", label: "Feedback comments", placeholder: "Help us improve...", required: false }
    ],
    landingPage: { enabled: false, heroTitle: "", heroSubtitle: "", faqs: [], contactEmail: "", contactPhone: "" },
    settings: { brandColor: "amber", thankYouTitle: "Feedback Logged!", thankYouMessage: "Thank you for taking time to provide satisfaction ratings." }
  }
};

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const cleanPrompt = prompt.toLowerCase();
    const geminiKey = req.headers.get("X-Gemini-Key") || process.env.GEMINI_API_KEY;

    if (geminiKey) {
      // Connect to Gemini API using fetch
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        
        const systemInstruction = `
          You are a form schema generator. Return ONLY a valid JSON object matching this structure:
          {
            "title": "Form title",
            "description": "Form description",
            "fields": [
              { "id": "field_id", "type": "text|email|phone|number|textarea|dropdown|radio|checkbox|date|rating|file|signature", "label": "Label", "placeholder": "Placeholder hint", "required": true|false, "options": ["Only if type is dropdown, radio, checkbox"] }
            ],
            "landingPage": {
              "enabled": true|false,
              "heroTitle": "Hero title",
              "heroSubtitle": "Hero subtitle text",
              "faqs": [ { "question": "FAQ Q", "answer": "FAQ A" } ],
              "contactEmail": "admin@email.com",
              "contactPhone": "Phone"
            },
            "settings": {
              "brandColor": "emerald|amber|ocean|purple",
              "thankYouTitle": "Success title",
              "thankYouMessage": "Success description message"
            }
          }
          Do not include any markdown formatting wrappers (like \`\`\`json) or extra text. Output raw JSON.
        `;

        const response = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemInstruction}\nGenerate form layout for: ${prompt}` }] }],
          }),
        });

        if (response.ok) {
          const resData = await response.json();
          const text = resData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          
          // Clean JSON string
          const cleanedText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanedText);
          return NextResponse.json(parsed);
        }
      } catch (err) {
        console.error("Gemini API call failed, falling back to local search matcher:", err);
      }
    }

    // LOCAL KEYWORD MATCHER FALLBACK
    let matchedTemplate = LOCAL_TEMPLATES.waitlist; // default

    if (cleanPrompt.includes("admission") || cleanPrompt.includes("school") || cleanPrompt.includes("student") || cleanPrompt.includes("class")) {
      matchedTemplate = LOCAL_TEMPLATES.admission;
    } else if (cleanPrompt.includes("job") || cleanPrompt.includes("apply") || cleanPrompt.includes("career") || cleanPrompt.includes("resume") || cleanPrompt.includes("recruit")) {
      matchedTemplate = LOCAL_TEMPLATES.job;
    } else if (cleanPrompt.includes("feedback") || cleanPrompt.includes("survey") || cleanPrompt.includes("satisfaction") || cleanPrompt.includes("review")) {
      matchedTemplate = LOCAL_TEMPLATES.feedback;
    } else if (cleanPrompt.includes("waitlist") || cleanPrompt.includes("beta") || cleanPrompt.includes("launch") || cleanPrompt.includes("queue")) {
      matchedTemplate = LOCAL_TEMPLATES.waitlist;
    } else {
      // Dynamic fallback template tailored using prompt keywords
      matchedTemplate = {
        title: `${prompt.charAt(0).toUpperCase() + prompt.slice(1)} Form`,
        description: `Form compiled automatically for: "${prompt}"`,
        fields: [
          { id: "name", type: "text", label: "Full Name", placeholder: "Enter name", required: true },
          { id: "email", type: "email", label: "Email Address", placeholder: "name@example.com", required: true },
          { id: "details", type: "textarea", label: "Inquiry Details", placeholder: "Specify information...", required: false }
        ],
        landingPage: {
          enabled: true,
          heroTitle: `Register for ${prompt}`,
          heroSubtitle: "Quickly fill in the registration details below to join.",
          faqs: [],
          contactEmail: "",
          contactPhone: ""
        },
        settings: {
          brandColor: "emerald",
          thankYouTitle: "Registration Received!",
          thankYouMessage: "Thank you for registering. Your details are secured."
        }
      };
    }

    return NextResponse.json(matchedTemplate);
  } catch (error: any) {
    console.error("AI Generate Error:", error);
    return NextResponse.json({ error: "Failed to generate AI form model." }, { status: 500 });
  }
}
