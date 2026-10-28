import React, { useEffect, useRef, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
let cashfreeLoadPromise;

function loadCashfree() {
  if (window.Cashfree) return Promise.resolve(window.Cashfree);
  if (!cashfreeLoadPromise) {
    cashfreeLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      script.onload = () => {
        if (window.Cashfree) {
          resolve(window.Cashfree);
        } else {
          cashfreeLoadPromise = null;
          reject(new Error("Cashfree checkout did not load."));
        }
      };
      script.onerror = () => {
        cashfreeLoadPromise = null;
        reject(new Error("Cashfree checkout did not load. Please try again."));
      };
      document.head.appendChild(script);
    });
  }
  return cashfreeLoadPromise;
}

const copy = {
  en: {
    nav: ["About", "Services", "Impact", "Gallery", "Contact"],
    volunteerNav: "Volunteer",
    donate: "Donate now",
    registration: "Reg: 291/2025 | Reg by Govt. of Puducherry",
    eyebrow: "A light of compassion",
    title: "A little kindness can bring warmth to someone's whole day.",
    intro:"A Public Charitable Trust established at Puducherry on 24 February 2025, constituted with the objective of undertaking charitable and public welfare activities for the benefit of society.",
    explore: "Explore our work",

    aboutLabel: "Who we are",
    aboutTitle: "Service, offered with an open heart.",
    aboutText:
      "We believe every person deserves food, clothing, and the comfort of being treated with dignity. Our work is shaped by the needs of the community and the spirit of Arutperunjothi — the great light of grace.",
    servicesLabel: "What we do",
    servicesTitle: "Care that meets people where they are.",

    services: [
      ["அன்னம் / Food support", "Preparing and sharing meals with people facing food insecurity."],
      ["Clothing with dignity", "Collecting and distributing useful clothing to people who need it."],
      ["Community care", "Listening to local needs and connecting people with practical support."],
    ],
    impactLabel: "Our impact",
    impactTitle: "Every act of care matters.",
    reported: "Figures shared by the trust; pending verification",
    stats: [
      ["12,500+", "meals served"],
      ["1,000+", "clothing items distributed"],
      ["3 years", "of service"],
    ],
    galleryLabel: "In the community",
    galleryTitle: "Small acts. Shared hope.",
    galleryIntro: "Moments from the community work shared by the trust.",
    galleryItems: ["Community gathering", "Sharing a meal", "Preparing food"],
    galleryAlts: [
      "A community gathering outside a building displaying an Arutperunjothi sign.",
      "A volunteer serves food to a community member.",
      "Volunteers prepare and serve food from a large cooking vessel.",
    ],
    contactLabel: "Get in touch",
    contactTitle: "We would be glad to hear from you.",
    contactIntro:
      "Contact details have not yet been verified. Please add the trust's approved phone number, email, and address before publishing.",
    contactCta: "Contact information to be confirmed",
    donationLabel: "Make a contribution",
    donationTitle: "Let compassion travel further.",
    donationIntro:
      "Choose an amount to support community care. Donations are currently unavailable until the trust's details and payment setup are verified.",
    amount: "Donation amount",
    custom: "Custom amount (₹)",
    name: "Your name",
    email: "Email address",
    phone: "Mobile number",
    donateSubmit: "Continue to secure payment",
    secureNote: "Payments are securely handled by Cashfree. No card data is stored on this website.",
    paymentOff: "Donations are not enabled yet. The trust must verify its details and configure Cashfree sandbox credentials first.",
    policiesLabel: "Important information",
    policiesTitle: "Clear, careful, and accountable.",
    policiesIntro:
      "The policy summaries below are launch placeholders, not approved legal policies. Have the trust review and publish complete policies before accepting donations.",
    policies: [
      ["Privacy", "Explain what donor information is collected, why it is used, who processes it, and how long it is retained."],
      ["Refunds", "Publish the trust-approved donation cancellation and refund process, including contact details and timelines."],
      ["Terms", "Publish approved donation terms, receipt practices, and applicable legal disclosures."],
    ],
    footer: "Rooted in compassion. Serving with dignity.",
    successTitle: "Checking your payment",
    successPending: "We are waiting for Cashfree to confirm this payment. This page will update automatically.",
    successCheckAgain: "Payment is still being checked. Refresh this page later to see the latest status.",
    successPaid: "Payment confirmed by Cashfree. Thank you for your generosity.",
    successFailed: "We could not confirm this payment. Please contact the trust before trying again.",
    language: "தமிழ்",
    languageLabel: "Language",
    menu: "Open menu",
    signIn: "Sign in",
    signUp: "Create account",
    signOut: "Sign out",
    signedInAs: "Signed in as",
    createAccount: "Create your account",
    welcomeBack: "Welcome back",
    fullName: "Full name",
    password: "Password",
    passwordHelp: "Use at least 12 characters.",
    continueWithGoogle: "Continue with Google",
    orEmail: "or use email",
    haveAccount: "Already have an account?",
    needAccount: "New here?",
    googleNeedsSetup: "Google sign-in is not configured yet. Add the Google OAuth client ID and secret to the backend environment.",

    authError: "We could not complete Google sign-in. Please try again.",
    accountCreated: "Your account has been created.",
    emailSignedIn: "You are signed in.",
    membershipTitle: "Membership Application",
    membershipIntro: "Please provide the required details below. Your Membership ID is generated after your application is saved.",
    applicantDetails: "1. Applicant Details",
    contactDetails: "2. Contact Details",
    areasOfInterest: "3. Area of Interest / Service",
    fatherSpouseName: "Father's / Spouse's Name",
    dateOfBirth: "Date of Birth",
    gender: "Gender",
    genderOptions: ["Male", "Female", "Other"],
    occupation: "Occupation",
    mobile: "Mobile Number",
    residentialAddress: "Residential Address",
    cityTown: "City / Town",
    district: "District",
    state: "State",
    pinCode: "PIN Code",
    selectOneOrMore: "Select one or more.",
    otherActivity: "Other Charitable Activity",
    membershipSubmit: "Submit Membership Application",
    membershipSubmitting: "Submitting…",
    membershipPrivacy: "Date received and Membership ID are generated by the system. Membership is automatically approved after successful database registration.",
    membershipSuccessTitle: "Your membership application was registered.",
    membershipError: "We could not submit your application. Check the details and try again.",
    membershipInterestError: "Select at least one area of interest.",
    membershipApproval: "Membership Approval",
    approved: "Approved",
    membershipId: "Membership ID",
    dateReceived: "Date Received",
    areaOfInterest: "Area of Interest",
    printCard: "Print Card",
    volunteerPrivacy: "Your application details are saved in the trust database and are not displayed publicly.",
    volunteerHome: "Home",
  },
  ta: {
    nav: ["எங்களைப் பற்றி", "சேவைகள்", "சாதனைகள்", "புகைப்படங்கள்", "தொடர்பு"],
    volunteerNav: "தன்னார்வலர்",
    donate: "நன்கொடை",
    registration: "Reg: 291/2025 | Reg by Govt. of Puducherry",
    eyebrow: "கருணையின் ஒளி",
    title: "சிறிய கருணையும் ஒருவரின் நாளை மகிழ்ச்சியாக்கும்.",
    intro:
      "அருட்பெருஞ்ஜோதி அறக்கட்டளை தமிழ்நாட்டில் உள்ள அறக்கட்டளையாக இங்கு குறிப்பிடப்படுகிறது. வெளியிடுவதற்கு முன் பதிவு விவரங்களையும் தற்போதைய திட்டங்களையும் சரிபார்க்க வேண்டும்.",
    explore: "எங்கள் சேவைகள்",
    note: "அறக்கட்டளை பதிவு, தொடர்பு விவரங்கள் மற்றும் சேவை எண்ணிக்கைகள் பொதுவில் வெளியிடுவதற்கு முன் சரிபார்க்கப்பட வேண்டும்.",
    aboutLabel: "நாங்கள் யார்",
    aboutTitle: "மனமார்ந்த சேவை.",
    aboutText:
      "ஒவ்வொருவருக்கும் உணவு, உடை மற்றும் கண்ணியமான அணுகுமுறை கிடைக்க வேண்டும் என்று நம்புகிறோம். சமூகத்தின் தேவைகளையும் அருட்பெருஞ்ஜோதியின் அருளொளியையும் மையமாகக் கொண்டு எங்கள் பணி அமைகிறது.",
    servicesLabel: "எங்கள் சேவைகள்",
    servicesTitle: "தேவையான இடத்தில் அக்கறை.",
    servicesIntro: "வழங்கப்பட்ட தகவலின் அடிப்படையிலான இந்தச் சேவை விவரங்களை அறங்காவலர்கள் உறுதிப்படுத்த வேண்டும்.",
    services: [
      ["உணவு உதவி", "உணவுத் தேவையுள்ள மக்களுக்காக உணவு தயாரித்து வழங்குதல்."],
      ["மரியாதையுடன் ஆடை", "தேவைப்படுவோருக்கு பயன்படும் ஆடைகளை சேகரித்து வழங்குதல்."],
      ["சமூக அக்கறை", "உள்ளூர் தேவைகளை அறிந்து நடைமுறை உதவியுடன் மக்களை இணைத்தல்."],
    ],
    impactLabel: "எங்கள் தாக்கம்",
    impactTitle: "ஒவ்வொரு உதவியும் முக்கியம்.",
    reported: "அறக்கட்டளை வழங்கிய தகவல்; சரிபார்ப்பு நிலுவையில்",
    stats: [
      ["12,500+", "வழங்கிய உணவுகள்"],
      ["1,000+", "வழங்கிய ஆடைகள்"],
      ["3 ஆண்டுகள்", "சேவை"],
    ],
    galleryLabel: "சமூகத்துடன்",
    galleryTitle: "சிறிய செயல்கள். பகிர்ந்த நம்பிக்கை.",
    galleryIntro: "அறக்கட்டளை பகிர்ந்த சமூகப் பணியின் தருணங்கள்.",
    galleryItems: ["சமூகக் கூடல்", "உணவு வழங்குதல்", "உணவு தயாரித்தல்"],
    galleryAlts: [
      "அருட்பெருஞ்ஜோதி பெயர்ப்பலகை உள்ள கட்டிடத்தின் முன் மக்கள் கூடுகின்றனர்.",
      "தன்னார்வலர் ஒருவருக்கு உணவு வழங்குகிறார்.",
      "பெரிய பாத்திரத்தில் தன்னார்வலர்கள் உணவு தயாரித்து வழங்குகின்றனர்.",
    ],
    contactLabel: "தொடர்பு கொள்ளுங்கள்",
    contactTitle: "உங்களிடமிருந்து கேட்க மகிழ்ச்சி.",
    contactIntro:
      "தொடர்பு விவரங்கள் இன்னும் சரிபார்க்கப்படவில்லை. வெளியிடுவதற்கு முன் அறக்கட்டளையின் அங்கீகரிக்கப்பட்ட தொலைபேசி, மின்னஞ்சல் மற்றும் முகவரியைச் சேர்க்கவும்.",
    contactCta: "தொடர்பு விவரங்கள் உறுதிசெய்யப்பட வேண்டும்",
    donationLabel: "பங்களியுங்கள்",
    donationTitle: "கருணை இன்னும் பலரைச் சென்றடையட்டும்.",
    donationIntro:
      "சமூக சேவைக்கு உதவும் தொகையைத் தேர்ந்தெடுக்கவும். அறக்கட்டளை விவரங்களும் கட்டண அமைப்பும் சரிபார்க்கப்படும் வரை நன்கொடை பெறுதல் முடக்கப்பட்டுள்ளது.",
    amount: "நன்கொடைத் தொகை",
    custom: "விருப்பத் தொகை (₹)",
    name: "உங்கள் பெயர்",
    email: "மின்னஞ்சல் முகவரி",
    phone: "கைபேசி எண்",
    donateSubmit: "பாதுகாப்பான கட்டணத்திற்குச் செல்லவும்",
    secureNote: "கட்டணங்களை Cashfree பாதுகாப்பாக கையாளுகிறது. அட்டை விவரங்கள் இந்த தளத்தில் சேமிக்கப்படாது.",
    paymentOff: "நன்கொடை இன்னும் செயல்படுத்தப்படவில்லை. முதலில் அறக்கட்டளை விவரங்களைச் சரிபார்த்து Cashfree sandbox விவரங்களை அமைக்க வேண்டும்.",
    policiesLabel: "முக்கிய தகவல்",
    policiesTitle: "தெளிவும் பொறுப்பும்.",
    policiesIntro:
      "கீழே உள்ள கொள்கைச் சுருக்கங்கள் வெளியீட்டுக்கான தற்காலிக உரைகள் மட்டுமே; அங்கீகரிக்கப்பட்ட சட்டக் கொள்கைகள் அல்ல. நன்கொடை பெறுவதற்கு முன் முழுமையான கொள்கைகளை அறக்கட்டளை சரிபார்த்து வெளியிட வேண்டும்.",
    policies: [
      ["தனியுரிமை", "எந்த நன்கொடையாளர் தகவல் சேகரிக்கப்படுகிறது, ஏன் பயன்படுத்தப்படுகிறது, யார் செயலாக்குகிறார்கள், எவ்வளவு காலம் சேமிக்கப்படும் என்பதை விளக்கவும்."],
      ["திருப்பிச் செலுத்துதல்", "அறக்கட்டளை அங்கீகரித்த ரத்து மற்றும் திருப்பிச் செலுத்தும் நடைமுறை, தொடர்பு விவரங்கள் மற்றும் காலவரம்புகளை வெளியிடவும்."],
      ["விதிமுறைகள்", "அங்கீகரிக்கப்பட்ட நன்கொடை விதிமுறைகள், ரசீது நடைமுறை மற்றும் பொருந்தும் சட்டத் தகவல்களை வெளியிடவும்."],
    ],
    footer: "கருணையில் வேரூன்றி. கண்ணியத்துடன் சேவை.",
    successTitle: "கட்டணம் சரிபார்க்கப்படுகிறது",
    successPending: "Cashfree உறுதிப்படுத்தலுக்காக காத்திருக்கிறோம். இந்தப் பக்கம் தானாகவே புதுப்பிக்கப்படும்.",
    successCheckAgain: "கட்டணம் இன்னும் சரிபார்க்கப்படுகிறது. சமீபத்திய நிலையைப் பார்க்க இந்தப் பக்கத்தைப் பின்னர் புதுப்பிக்கவும்.",
    successPaid: "Cashfree கட்டணத்தை உறுதிப்படுத்தியுள்ளது. உங்கள் கொடைக்கு நன்றி.",
    successFailed: "இந்தக் கட்டணத்தை உறுதிப்படுத்த முடியவில்லை. மீண்டும் முயற்சிக்கும் முன் அறக்கட்டளையைத் தொடர்புகொள்ளவும்.",
    language: "English",
    languageLabel: "மொழி",
    menu: "பட்டியலைத் திற",
    signIn: "உள்நுழை",
    signUp: "கணக்கு உருவாக்கு",
    signOut: "வெளியேறு",
    signedInAs: "உள்நுழைந்துள்ளீர்கள்:",
    createAccount: "உங்கள் கணக்கை உருவாக்குங்கள்",
    welcomeBack: "மீண்டும் வருக",
    fullName: "முழுப் பெயர்",
    password: "கடவுச்சொல்",
    passwordHelp: "குறைந்தது 12 எழுத்துகள் பயன்படுத்தவும்.",
    continueWithGoogle: "Google மூலம் தொடரவும்",
    orEmail: "அல்லது மின்னஞ்சல் பயன்படுத்தவும்",
    haveAccount: "ஏற்கனவே கணக்கு உள்ளதா?",
    needAccount: "புதியவரா?",
    googleNeedsSetup: "Google உள்நுழைவு இன்னும் அமைக்கப்படவில்லை. பின்தளத்தில் Google OAuth client ID மற்றும் secret சேர்க்கவும்.",
    googleRedirectHint: "Google Cloud Console-இல் Authorized redirect URIs பகுதியில் இந்த URL-ஐ அப்படியே சேர்க்கவும்:",
    authError: "Google உள்நுழைவை முடிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    authSuccess: "Google மூலம் உள்நுழைந்துள்ளீர்கள்.",
    accountCreated: "உங்கள் கணக்கு உருவாக்கப்பட்டது.",
    emailSignedIn: "நீங்கள் உள்நுழைந்துள்ளீர்கள்.",
    membershipTitle: "உறுப்பினர் விண்ணப்பம்",
    membershipIntro: "கீழே தேவையான விவரங்களை வழங்கவும். விண்ணப்பம் சேமிக்கப்பட்ட பிறகு உறுப்பினர் எண் உருவாக்கப்படும்.",
    applicantDetails: "1. விண்ணப்பதாரர் விவரங்கள்",
    contactDetails: "2. தொடர்பு விவரங்கள்",
    areasOfInterest: "3. சேவை / ஆர்வத் துறை",
    fatherSpouseName: "தந்தை / துணைவர் பெயர்",
    dateOfBirth: "பிறந்த தேதி",
    gender: "பாலினம்",
    genderOptions: ["ஆண்", "பெண்", "மற்றவை"],
    occupation: "தொழில்",
    mobile: "கைபேசி எண்",
    residentialAddress: "குடியிருப்பு முகவரி",
    cityTown: "நகரம் / ஊர்",
    district: "மாவட்டம்",
    state: "மாநிலம்",
    pinCode: "அஞ்சல் குறியீடு",
    selectOneOrMore: "ஒன்று அல்லது அதற்கு மேற்பட்டவற்றைத் தேர்ந்தெடுக்கவும்.",
    otherActivity: "பிற அறப்பணி",
    membershipSubmit: "உறுப்பினர் விண்ணப்பத்தை சமர்ப்பிக்கவும்",
    membershipSubmitting: "சமர்ப்பிக்கப்படுகிறது…",
    membershipPrivacy: "பெறப்பட்ட தேதி மற்றும் உறுப்பினர் எண் தானாக உருவாக்கப்படும். தரவுத்தளத்தில் வெற்றிகரமாகப் பதிவு செய்யப்பட்டதும் உறுப்பினர் சேர்க்கை தானாக அங்கீகரிக்கப்படும்.",
    membershipSuccessTitle: "உங்கள் உறுப்பினர் விண்ணப்பம் பதிவு செய்யப்பட்டது.",
    membershipError: "உங்கள் விண்ணப்பத்தை சமர்ப்பிக்க முடியவில்லை. விவரங்களைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
    membershipInterestError: "குறைந்தது ஒரு ஆர்வத் துறையைத் தேர்ந்தெடுக்கவும்.",
    membershipApproval: "உறுப்பினர் ஒப்புதல்",
    approved: "அங்கீகரிக்கப்பட்டது",
    membershipId: "உறுப்பினர் எண்",
    dateReceived: "பெறப்பட்ட தேதி",
    areaOfInterest: "ஆர்வத் துறை",
    printCard: "அட்டையை அச்சிடு",
    volunteerPrivacy: "உங்கள் விண்ணப்ப விவரங்கள் அறக்கட்டளையின் தரவுத்தளத்தில் சேமிக்கப்படும்; அவை பொதுவில் காட்டப்படாது.",
    volunteerHome: "முகப்பு",
  },
};

const membershipInterestOptions = [
  ["Food & Meal Services", "Food & Meal Services", "உணவு மற்றும் உணவு வழங்கும் சேவைகள்"],
  ["Educational Support & Scholarships", "Educational Support & Scholarships", "கல்வி உதவி மற்றும் கல்வி உதவித்தொகை"],
  ["Books & Educational Materials", "Books & Educational Materials", "புத்தகங்கள் மற்றும் கல்விப் பொருட்கள்"],
  ["Publications & Knowledge Activities", "Publications & Knowledge Activities", "வெளியீடுகள் மற்றும் அறிவுசார் செயல்பாடுகள்"],
  ["Support for Orphanages", "Support for Orphanages", "அனாதை இல்லங்களுக்கான ஆதரவு"],
  ["Support for Old-Age Homes", "Support for Old-Age Homes", "முதியோர் இல்லங்களுக்கான ஆதரவு"],
  ["Disaster Relief", "Disaster Relief", "பேரிடர் நிவாரணம்"],
  ["Medical Camps", "Medical Camps", "மருத்துவ முகாம்கள்"],
  ["Community Welfare & Public Utility", "Community Welfare & Public Utility", "சமூக நலன் மற்றும் பொதுப் பயன்பாடு"],
  ["Other Charitable Activities", "Other Charitable Activities", "பிற அறப்பணிகள்"],
];

function VolunteerPage() {
  const [language, setLanguage] = useState(
    new URLSearchParams(window.location.search).get("lang") === "ta" ? "ta" : "en",
  );
  const [form, setForm] = useState({
    full_name: "",
    father_spouse_name: "",
    date_of_birth: "",
    gender: "",
    occupation: "",
    mobile: "",
    email: "",
    residential_address: "",
    city_town: "",
    district: "",
    state: "",
    pin_code: "",
    interests: [],
    other_charitable_activity: "",
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("");
  const [membership, setMembership] = useState(null);
  const text = copy[language];
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const selectedInterests = membership?.interests
    .map((interest) => membershipInterestOptions.find(([value]) => value === interest)?.[language === "ta" ? 2 : 1])
    .filter(Boolean)
    .join(", ");

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === "ta"
      ? "உறுப்பினர் விண்ணப்பம் | அருட்பெருஞ்ஜோதி அறக்கட்டளை"
      : "Membership Application | Arutperunjothi Trust";
  }, [language]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleInterest(value, checked) {
    setForm((current) => ({
      ...current,
      interests: checked
        ? [...current.interests, value]
        : current.interests.filter((interest) => interest !== value),
    }));
  }

  async function submitApplication(event) {
    event.preventDefault();
    if (form.interests.length === 0) {
      setStatus(text.membershipInterestError);
      setStatusType("error");
      return;
    }
    setSaving(true);
    setStatus("");
    setStatusType("");
    try {
      const response = await fetch(`${API_BASE}/api/membership-applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          email: form.email.trim() || null,
          father_spouse_name: form.father_spouse_name.trim() || null,
          occupation: form.occupation.trim() || null,
          other_charitable_activity: form.other_charitable_activity.trim() || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const detail = Array.isArray(data.detail) ? data.detail[0]?.msg : data.detail;
        throw new Error(detail || text.membershipError);
      }
      setMembership(data);
    } catch (error) {
      setStatus(error instanceof TypeError ? text.membershipError : error.message || text.membershipError);
      setStatusType("error");
    } finally {
      setSaving(false);
    }
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat(language === "ta" ? "ta-IN" : "en-IN", {
      dateStyle: "medium",
      timeZone: "UTC",
    }).format(new Date(`${value}T00:00:00Z`));
  }

  return (
    <div className="volunteer-page">
      <header className="volunteer-header">
        <a className="brand" href={`/?lang=${language}#home`}>
          <span className="brand-seal" aria-hidden="true">அ</span>
          <span>
            <strong>Arutperunjothi Trust -Bahour</strong>
            <small lang="ta">அருட்பெருஞ்ஜோதி அறக்கட்டளை</small>
          </span>
        </a>
        <div className="volunteer-header-actions">
          <div className="language-switcher" role="group" aria-label="Language">
            <button className={language === "en" ? "language-choice active" : "language-choice"} type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>English</button>
            <button className={language === "ta" ? "language-choice active" : "language-choice"} type="button" aria-pressed={language === "ta"} lang="ta" onClick={() => setLanguage("ta")}>தமிழ்</button>
          </div>
          <a className="volunteer-home-link" href={`/?lang=${language}#home`}>{text.volunteerHome}</a>
        </div>
      </header>
      <main className="volunteer-main">
        <section className="volunteer-intro">
          <p className="eyebrow">{text.volunteerNav}</p>
          <h1>{text.membershipTitle}</h1>
          <p>{text.membershipIntro}</p>
        </section>
        {!membership ? (
          <form id="membershipForm" className="volunteer-form membership-form" onSubmit={submitApplication}>
            <section className="membership-section">
              <h2>{text.applicantDetails}</h2>
              <div className="membership-grid">
                <label className="field-label">{text.fullName} <span aria-hidden="true">*</span>
                  <input required name="full_name" autoComplete="name" maxLength="150" value={form.full_name} onChange={updateField} />
                </label>
                <label className="field-label">{text.fatherSpouseName}
                  <input name="father_spouse_name" maxLength="150" value={form.father_spouse_name} onChange={updateField} />
                </label>
                <label className="field-label">{text.dateOfBirth} <span aria-hidden="true">*</span>
                  <input required name="date_of_birth" type="date" max={today} value={form.date_of_birth} onChange={updateField} />
                </label>
                <fieldset className="membership-gender">
                  <legend>{text.gender} <span aria-hidden="true">*</span></legend>
                  {["Male", "Female", "Other"].map((gender, index) => (
                    <label className="membership-choice" key={gender}>
                      <input required={index === 0} type="radio" name="gender" value={gender} checked={form.gender === gender} onChange={updateField} />
                      {text.genderOptions[index]}
                    </label>
                  ))}
                </fieldset>
                <label className="field-label">{text.occupation}
                  <input name="occupation" maxLength="120" value={form.occupation} onChange={updateField} />
                </label>
              </div>
            </section>

            <section className="membership-section">
              <h2>{text.contactDetails}</h2>
              <div className="membership-grid">
                <label className="field-label">{text.mobile} <span aria-hidden="true">*</span>
                  <input required name="mobile" type="tel" autoComplete="tel" inputMode="tel" maxLength="20" value={form.mobile} onChange={updateField} />
                </label>
                <label className="field-label">{text.email}
                  <input name="email" type="email" autoComplete="email" maxLength="254" value={form.email} onChange={updateField} />
                </label>
                <label className="field-label membership-wide">{text.residentialAddress} <span aria-hidden="true">*</span>
                  <textarea required name="residential_address" maxLength="500" rows="3" autoComplete="street-address" value={form.residential_address} onChange={updateField} />
                </label>
                <label className="field-label">{text.cityTown} <span aria-hidden="true">*</span>
                  <input required name="city_town" maxLength="100" autoComplete="address-level2" value={form.city_town} onChange={updateField} />
                </label>
                <label className="field-label">{text.district} <span aria-hidden="true">*</span>
                  <input required name="district" maxLength="100" value={form.district} onChange={updateField} />
                </label>
                <label className="field-label">{text.state} <span aria-hidden="true">*</span>
                  <input required name="state" maxLength="100" autoComplete="address-level1" value={form.state} onChange={updateField} />
                </label>
                <label className="field-label">{text.pinCode} <span aria-hidden="true">*</span>
                  <input required name="pin_code" inputMode="numeric" maxLength="10" autoComplete="postal-code" pattern="[0-9]{4,10}" value={form.pin_code} onChange={updateField} />
                </label>
              </div>
            </section>

            <section className="membership-section">
              <h2>{text.areasOfInterest}</h2>
              <p className="membership-helper">{text.selectOneOrMore}</p>
              <div className="membership-interests">
                {membershipInterestOptions.map(([value, english, tamil]) => (
                  <label className="membership-interest" key={value}>
                    <input
                      type="checkbox"
                      name="interests"
                      value={value}
                      checked={form.interests.includes(value)}
                      onChange={(event) => toggleInterest(value, event.target.checked)}
                    />
                    {language === "ta" ? tamil : english}
                  </label>
                ))}
              </div>
              {form.interests.includes("Other Charitable Activities") && (
                <label className="field-label other-activity-field">{text.otherActivity} <span aria-hidden="true">*</span>
                  <input required name="other_charitable_activity" maxLength="300" value={form.other_charitable_activity} onChange={updateField} />
                </label>
              )}
            </section>

            {status && <p className={`volunteer-status ${statusType}`} role="alert">{status}</p>}
            <button className="button button-brown payment-button" type="submit" disabled={saving}>
              {saving ? text.membershipSubmitting : text.membershipSubmit}
            </button>
            <p className="volunteer-privacy">{text.membershipPrivacy}</p>
          </form>
        ) : (
          <section id="success" className="membership-success" aria-live="polite">
            <p className="eyebrow">{language === "ta" ? "பதிவு வெற்றிகரமாக முடிந்தது" : "Registration Successful"}</p>
            <h2>{text.membershipSuccessTitle}</h2>
            <p>{text.membershipApproval}: <strong>{text.approved}</strong></p>
            <div id="card" className="membership-id-card">
              <p className="membership-card-title">ARUTPERUNJOTHI TRUST</p>
              <p className="membership-card-subtitle">Registered Public Charitable Trust</p>
              <p>Bahour, Puducherry</p>
              <hr />
              <h3>{language === "ta" ? "உறுப்பினர் அடையாள அட்டை" : "Membership ID Card"}</h3>
              <p>{text.fullName}: <strong>{membership.full_name}</strong></p>
              <p>{text.membershipId}: <strong>{membership.membership_id}</strong></p>
              <p>{text.dateReceived}: <strong>{formatDate(membership.date_received)}</strong></p>
              <p>{text.areaOfInterest}: <strong>{selectedInterests}</strong></p>
            </div>
            <div className="membership-actions">
              <button type="button" onClick={() => window.print()}>{text.printCard}</button>
              <a href={`/?lang=${language}#home`}>{text.volunteerHome}</a>
            </div>
          </section>
        )}
      </main>
      <footer className="site-footer volunteer-footer">
        <p>{text.footer}</p>
        <small>© {new Date().getFullYear()} Arutperunjothi Trust</small>
      </footer>
    </div>
  );
}

function LotusLamp() {
  return (
    <svg className="lotus-lamp" viewBox="0 0 400 360" role="img" aria-label="Decorative lotus and lamp">
      <defs>
        <linearGradient id="gold" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f7d98c" />
          <stop offset="1" stopColor="#b88634" />
        </linearGradient>
      </defs>
      <circle cx="205" cy="176" r="139" fill="none" stroke="url(#gold)" strokeOpacity=".24" />
      <circle cx="205" cy="176" r="119" fill="none" stroke="url(#gold)" strokeOpacity=".18" />
      <g fill="url(#gold)" stroke="#9c6d2c" strokeWidth="2">
        <path d="M205 185C153 130 164 85 205 59c40 27 51 72 0 126Z" />
        <path d="M199 186c-60-35-101-25-116 5 24 34 67 42 116-5Z" />
        <path d="M211 186c59-35 100-25 115 5-24 34-67 42-115-5Z" />
        <path d="M194 193c-58-2-89 22-87 53 33 23 71 9 87-53Z" />
        <path d="M216 193c58-2 89 22 87 53-33 23-71 9-87-53Z" />
        <path d="M162 244c23 29 62 40 84 39 22 1 61-10 84-39-61 16-107 17-168 0Z" />
        <path d="M172 280h66l-12 22h-42l-12-22Z" />
        <path d="M162 306h86l-10 11h-67l-9-11Z" />
      </g>
      <path d="M205 177c-22 21-18 41 0 52 18-11 22-31 0-52Z" fill="#fff4c4" />
      <path d="M205 197c-12 17-8 31 0 38 8-7 12-21 0-38Z" fill="#f1b750" />
    </svg>
  );
}

function HomePage() {
  const [language, setLanguage] = useState(
    new URLSearchParams(window.location.search).get("lang") === "ta" ? "ta" : "en",
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [config, setConfig] = useState({
    donations_enabled: false,
    payment_mode: "sandbox",
    google_sign_in_enabled: false,
    google_redirect_uri: "http://localhost:8000/api/auth/google/callback",
  });
  const [authUser, setAuthUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [amount, setAmount] = useState("250");
  const [customAmount, setCustomAmount] = useState("");
  const [donor, setDonor] = useState({ name: "", email: "", phone: "" });
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const orderRequestRef = useRef({ fingerprint: "", key: "" });
  const text = copy[language];
  const orderId = new URLSearchParams(window.location.search).get("order_id");

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    fetch(`${API_BASE}/api/config`)
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load donation settings.");
        return response.json();
      })
      .then(setConfig)
      .catch(() => setConfig({
        donations_enabled: false,
        payment_mode: "sandbox",
        google_sign_in_enabled: false,
        google_redirect_uri: "http://localhost:8000/api/auth/google/callback",
      }));
    fetch(`${API_BASE}/api/auth/me`, { credentials: "include" })
      .then((response) => response.ok ? response.json() : null)
      .then((user) => setAuthUser(user))
      .catch(() => setAuthUser(null));

    const authResult = new URLSearchParams(window.location.search).get("auth");
    if (authResult === "google_success") setAuthNotice(text.authSuccess);
    if (authResult === "google_error") {
      setAuthError(text.authError);
      setAuthOpen(true);
    }
    if (authResult) {
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      window.history.replaceState({}, "", url);
    }
  }, [text.authError, text.authSuccess]);

  useEffect(() => {
    if (!authOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setAuthOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [authOpen]);

  useEffect(() => {
    if (!orderId) return undefined;
    let active = true;
    let timer;
    let attempts = 0;
    const check = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/donations/${encodeURIComponent(orderId)}`);
        if (!response.ok) throw new Error("Could not check payment status.");
        const data = await response.json();
        if (!active) return;
        setPaymentStatus(data.status);
        if (data.status === "PAID") {
          setPaymentMessage(text.successPaid);
        } else if (data.status === "PENDING") {
          if (attempts < 24) {
            attempts += 1;
            setPaymentMessage(text.successPending);
            timer = window.setTimeout(check, 2500);
          } else {
            setPaymentMessage(text.successCheckAgain);
          }
        } else {
          setPaymentMessage(text.successFailed);
        }
      } catch {
        if (active) {
          setPaymentStatus("ERROR");
          setPaymentMessage(text.successFailed);
        }
      }
    };
    check();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [orderId, text.successCheckAgain, text.successFailed, text.successPaid, text.successPending]);

  const navLinks = [
    ["#about", text.nav[0]],
    ["#services", text.nav[1]],
    ["#impact", text.nav[2]],
    ["#gallery", text.nav[3]],
    ["#contact", text.nav[4]],
  ];

  function openAuth(mode = "signin") {
    setAuthMode(mode);
    setAuthError("");
    setAuthNotice("");
    setAuthOpen(true);
    setMenuOpen(false);
  }

  async function submitAuth(event) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    try {
      const response = await fetch(`${API_BASE}/api/auth/${authMode}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Unable to sign in.");
      setAuthUser(data);
      setAuthOpen(false);
      setAuthForm({ name: "", email: "", password: "" });
      setAuthNotice(authMode === "signup" ? text.accountCreated : text.emailSignedIn);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthBusy(false);
    }
  }

  async function signOut() {
    try {
      const response = await fetch(`${API_BASE}/api/auth/signout`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Unable to sign out.");
      setAuthUser(null);
      setAuthNotice("");
      setMenuOpen(false);
    } catch (error) {
      setAuthNotice(error.message);
    }
  }

  function startGoogleSignIn() {
    if (!config.google_sign_in_enabled) return;
    window.location.assign(`${API_BASE}/api/auth/google/start`);
  }

  async function submitDonation(event) {
    event.preventDefault();
    setPaymentMessage("");
    setLoading(true);
    try {
      const amountInRupees = Number(amount === "custom" ? customAmount : amount);
      if (!Number.isInteger(amountInRupees) || amountInRupees < 100 || amountInRupees > 1000000) {
        throw new Error(language === "ta" ? "தொகை ₹100 முதல் ₹10,00,000 வரை இருக்க வேண்டும்." : "Enter an amount from ₹100 to ₹10,00,000.");
      }
      const orderRequest = { amount: amountInRupees, ...donor };
      const fingerprint = JSON.stringify(orderRequest);
      if (orderRequestRef.current.fingerprint !== fingerprint) {
        orderRequestRef.current = { fingerprint, key: crypto.randomUUID() };
      }
      const response = await fetch(`${API_BASE}/api/donations/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": orderRequestRef.current.key,
        },
        body: JSON.stringify(orderRequest),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Unable to start payment.");
      const Cashfree = await loadCashfree();
      const cashfree = Cashfree({ mode: data.payment_mode });
      await cashfree.checkout({ paymentSessionId: data.payment_session_id, redirectTarget: "_self" });
    } catch (error) {
      setPaymentMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Arutperunjothi Trust home">
          <span className="brand-seal" aria-hidden="true">அ</span>
          <span>
            <strong>Arutperunjothi Trust -Bahour</strong>
            <small lang="ta">அருட்பெருஞ்ஜோதி அறக்கட்டளை</small>
          </span>
        </a>
        <div className="header-utilities">
          <a className="nav-volunteer" href={`/volunteer?lang=${language}`}>{text.volunteerNav}</a>
          {authUser ? (
            <div className="nav-account">
              <span className="account-name" title={authUser.email}>{authUser.name}</span>
              <button className="nav-auth-button" type="button" onClick={signOut}>{text.signOut}</button>
            </div>
          ) : (
            <div className="nav-auth-group">
              <button className="nav-auth-button" type="button" onClick={() => openAuth("signin")}>{text.signIn}</button>
              <button className="nav-auth-button nav-auth-secondary" type="button" onClick={() => openAuth("signup")}>{text.signUp}</button>
            </div>
          )}
          <div className="language-switcher" role="group" aria-label={text.languageLabel}>
            <button className={language === "en" ? "language-choice active" : "language-choice"} type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>English</button>
            <button className={language === "ta" ? "language-choice active" : "language-choice"} type="button" aria-pressed={language === "ta"} lang="ta" onClick={() => setLanguage("ta")}>தமிழ்</button>
          </div>
        </div>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-label={text.menu}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span></span><span></span><span></span>
        </button>
        <nav className={menuOpen ? "main-nav open" : "main-nav"} aria-label="Main navigation">
          {navLinks.map(([href, label]) => (
            <a href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
          <a className="nav-donate" href="/payment" onClick={() => setMenuOpen(false)}>{text.donate}</a>
        </nav>
      </header>

      {authNotice && <p className="auth-notice" role="status">{authNotice}</p>}
      {authOpen && (
        <div className="auth-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setAuthOpen(false);
        }}>
          <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
            <button className="auth-close" type="button" aria-label="Close sign in" onClick={() => setAuthOpen(false)}>×</button>
            <div className="section-kicker"><span>Arutperunjothi Trust</span></div>
            <h2 id="auth-title">{authMode === "signup" ? text.createAccount : text.welcomeBack}</h2>
            <button
              className="google-auth-button"
              type="button"
              onClick={startGoogleSignIn}
              disabled={!config.google_sign_in_enabled || authBusy}
              title={!config.google_sign_in_enabled ? text.googleNeedsSetup : undefined}
            >
              <span className="google-g" aria-hidden="true">G</span>
              {text.continueWithGoogle}
            </button>
            {!config.google_sign_in_enabled && <p className="google-setup-note">{text.googleNeedsSetup}</p>}
            <p className="google-redirect-hint">
              {text.googleRedirectHint}
              <code>{config.google_redirect_uri}</code>
            </p>
            <div className="auth-divider"><span>{text.orEmail}</span></div>
            <form className="auth-form" onSubmit={submitAuth}>
              {authMode === "signup" && (
                <label className="field-label">{text.fullName}
                  <input
                    required
                    autoFocus
                    autoComplete="name"
                    maxLength="100"
                    value={authForm.name}
                    onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                  />
                </label>
              )}
              <label className="field-label">{text.email}
                <input
                  required
                  autoFocus={authMode === "signin"}
                  type="email"
                  autoComplete="email"
                  maxLength="254"
                  value={authForm.email}
                  onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                />
              </label>
              <label className="field-label">{text.password}
                <input
                  required
                  type="password"
                  autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                  minLength={authMode === "signup" ? 12 : 1}
                  maxLength="128"
                  value={authForm.password}
                  onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                />
              </label>
              {authMode === "signup" && <p className="password-help">{text.passwordHelp}</p>}
              {authError && <p className="auth-error" role="alert">{authError}</p>}
              <button className="button button-brown auth-submit" type="submit" disabled={authBusy}>
                {authBusy ? "…" : authMode === "signup" ? text.signUp : text.signIn}
              </button>
            </form>
            <p className="auth-mode-switch">
              {authMode === "signup" ? text.haveAccount : text.needAccount}{" "}
              <button type="button" onClick={() => {
                setAuthMode(authMode === "signup" ? "signin" : "signup");
                setAuthError("");
              }}>
                {authMode === "signup" ? text.signIn : text.signUp}
              </button>
            </p>
          </section>
        </div>
      )}

      <main>
        <section className="hero" id="home">
          <div className="hero-pattern" aria-hidden="true"></div>
          <div className="hero-copy">
            <p className="registration-badge">{text.registration}</p>
            <p className="eyebrow">{text.eyebrow}</p>
            <h1>{text.title}</h1>
            <p className="hero-intro">{text.intro}</p>
            <div className="hero-actions">
              <a className="button button-gold" href="/payment">{text.donate}</a>
              <a className="text-link" href="#about">{text.explore}</a>
            </div>
            <p className="verification-note">{text.note}</p>
          </div>
          <div className="hero-art">
            <div className="hero-art-disc"></div>
            <LotusLamp />
            <div className="hero-art-caption"><span>அருட்பெருஞ்ஜோதி</span><small>Light of grace</small></div>
          </div>
        </section>

        <section className="about section-wrap" id="about">
          <div className="section-kicker"><span>{text.aboutLabel}</span></div>
          <div className="about-grid">
            <h2>{text.aboutTitle}</h2>
            <div>
              <p>{text.aboutText}</p>
              <p className="about-signature" lang="ta">அருட்பெருஞ்ஜோதி · தனிப்பெருங்கருணை</p>
            </div>
          </div>
        </section>

        <section className="services section-wrap" id="services">
          <div className="section-heading">
            <div className="section-kicker"><span>{text.servicesLabel}</span></div>
            <h2>{text.servicesTitle}</h2>
            <p>{text.servicesIntro}</p>
          </div>
          <div className="service-grid">
            {text.services.map(([title, description]) => (
              <article className="service-card" key={title}>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="impact section-wrap" id="impact">
          <div className="impact-heading">
            <div className="section-kicker light"><span>{text.impactLabel}</span></div>
            <h2>{text.impactTitle}</h2>
            <p className="impact-caveat">{text.reported}</p>
          </div>
          <div className="stats-grid">
            {text.stats.map(([value, label]) => (
              <div className="stat" key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
                <i aria-hidden="true"></i>
              </div>
            ))}
          </div>
          <p className="impact-disclaimer">{text.note}</p>
        </section>

        <section className="gallery section-wrap" id="gallery">
          <div className="section-heading gallery-heading">
            <div className="section-kicker"><span>{text.galleryLabel}</span></div>
            <h2>{text.galleryTitle}</h2>
            <p>{text.galleryIntro}</p>
          </div>
          <div className="gallery-grid" aria-label={text.galleryTitle}>
            {text.galleryItems.map((label, index) => (
              <figure className={`gallery-tile gallery-${index + 1}`} key={label}>
                <img
                  className="gallery-photo"
                  src={`/images/img${index + 1}.jpeg`}
                  alt={text.galleryAlts[index]}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption><span>0{index + 1}</span>{label}</figcaption>
              </figure>
            ))}
          </div>

        </section>

        <section className="contact section-wrap" id="contact">
          <div>
            <div className="section-kicker"><span>{text.contactLabel}</span></div>
            <h2>{text.contactTitle}</h2>
            <p>{text.contactIntro}</p>
          </div>
        </section>

        <section className="policies section-wrap" id="policies">
          <div className="section-heading">
            <div className="section-kicker"><span>07</span><span>{text.policiesLabel}</span></div>
            <h2>{text.policiesTitle}</h2>
            <p>{text.policiesIntro}</p>
          </div>
          <div className="policy-grid">
            {text.policies.map(([title, description]) => (
              <article key={title}><h3>{title}</h3><p>{description}</p></article>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-seal" aria-hidden="true">அ</span>
          <span><strong>Arutperunjothi Trust</strong><small lang="ta">அருட்பெருஞ்ஜோதி அறக்கட்டளை</small></span>
        </a>
        <p>{text.footer}</p>
        <a href="#policies">{language === "ta" ? "தனியுரிமை · திருப்பிச் செலுத்துதல் · விதிமுறைகள்" : "Privacy · Refunds · Terms"}</a>
        <small>© {new Date().getFullYear()} Arutperunjothi Trust</small>
      </footer>
    </div>
  );
}

function PaymentPage() {
  const language = new URLSearchParams(window.location.search).get("lang") === "ta" ? "ta" : "en";

  useEffect(() => {
    document.title = language === "ta"
      ? "ஆன்லைன் கட்டணம் | அருட்பெருஞ்ஜோதி அறக்கட்டளை"
      : "Pay Online | Arutperunjothi Trust";
  }, [language]);

  const tamil = language === "ta";
  return (
    <div className="payment-page-shell">
      <header className="payment-header">
        <a className="brand" href={`/?lang=${language}#home`}>
          <img className="payment-logo" src="/images/logo.png" alt="Arutperunjothi Trust logo" />
          <span>
            <strong>Arutperunjothi Trust - Bahour</strong>
            <small lang="ta">அருட்பெருஞ்ஜோதி அறக்கட்டளை</small>
          </span>
        </a>
        <a className="back-home" href={`/?lang=${language}#home`}>{tamil ? "முகப்பு" : "Home"}</a>
      </header>
      <main className="payment-main">
        <section className="payment-intro">
          <p className="kicker">{tamil ? "நன்கொடை / கட்டணம்" : "DONATION / PAYMENT"}</p>
          <h1>{tamil ? "அருட்பெருஞ்ஜோதி அறக்கட்டளைக்கு ஆதரவு அளியுங்கள்" : "Support Arutperunjothi Trust"}</h1>
          <p>{tamil ? "பதிவு செய்யப்பட்ட பொது தொண்டு அறக்கட்டளை. கீழுள்ள அதிகாரப்பூர்வ வங்கி விவரங்களைப் பயன்படுத்தி நன்கொடை வழங்கலாம்." : "Registered Public Charitable Trust. You can use the official trust bank details below for your contribution."}</p>
        </section>
        <section className="bank-details-card">
          <h2>{tamil ? "வங்கி கணக்கு விவரங்கள்" : "Bank Account Details"}</h2>
          <dl>
            <div><dt>{tamil ? "வங்கி பெயர்" : "Bank Name"}</dt><dd>UCO BANK</dd></div>
            <div><dt>{tamil ? "கணக்கு பெயர்" : "Account Name"}</dt><dd>ARUDPERUNJOTHI TRUST</dd></div>
            <div><dt>{tamil ? "கணக்கு எண்" : "Account Number"}</dt><dd>031202ERUNJ7288</dd></div>
            <div><dt>{tamil ? "கிளை" : "Branch"}</dt><dd>BAHOUR</dd></div>
            <div><dt>{tamil ? "IFSC குறியீடு" : "IFSC Code"}</dt><dd>UCBA000312</dd></div>
          </dl>
        </section>
        <section className="bank-transfer-card">
          <h2>{tamil ? "வங்கி மாற்றம்" : "Bank Transfer"}</h2>
          <p>{tamil ? "தற்போதைக்கு, மேலே காட்டப்பட்டுள்ள அறக்கட்டளையின் அதிகாரப்பூர்வ வங்கி கணக்கு விவரங்களைப் பயன்படுத்தி நன்கொடை வழங்கலாம். UPI மற்றும் ஆன்லைன் கட்டண வசதிகள் பின்னர் சேர்க்கப்படும்." : "For now, contributions can be made using the official Trust bank account details shown above. UPI and online payment options will be added later."}</p>
        </section>
      </main>
      <footer className="payment-footer"><p>Love | Grace | Compassion | Service</p><p>© {new Date().getFullYear()} Arutperunjothi Trust - Bahour</p></footer>
    </div>
  );
}

function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/volunteer") return <VolunteerPage />;
  if (path === "/payment") return <PaymentPage />;
  return <HomePage />;
}

export default App;
