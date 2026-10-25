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
    donate: "Donate now",
    eyebrow: "A light of compassion",
    title: "A little kindness can bring warmth to someone's whole day.",
    intro:
      "Arutperunjothi Trust is presented here as a trust in Pondicherry, India. Its registration details and current programmes should be verified before publication.",
    explore: "Explore our work",

    aboutLabel: "Who we are",
    aboutTitle: "Service, offered with an open heart.",
    aboutText:
      "We believe every person deserves food, clothing, and the comfort of being treated with dignity. Our work is shaped by the needs of the community and the spirit of Arutperunjothi — the great light of grace.",
    servicesLabel: "What we do",
    servicesTitle: "Care that meets people where they are.",
    servicesIntro: "These draft service descriptions are based on the supplied brief and should be confirmed by the trustees.",
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
    galleryIntro: "A glimpse of the work, ready for verified photographs.",
    galleryItems: ["Meals shared", "Care in action", "Neighbours together"],
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
    authSuccess: "You are signed in with Google.",
    accountCreated: "Your account has been created.",
    emailSignedIn: "You are signed in.",
  },
  ta: {
    nav: ["எங்களைப் பற்றி", "சேவைகள்", "சாதனைகள்", "புகைப்படங்கள்", "தொடர்பு"],
    donate: "நன்கொடை",
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
    galleryIntro: "சரிபார்க்கப்பட்ட புகைப்படங்கள் சேர்க்கப்படும் வரை இது முன்னோட்டம்.",
    galleryItems: ["உணவு வழங்குதல்", "சேவையில் அக்கறை", "ஒன்றிணைந்த அயலவர்கள்"],
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
  },
};

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

function App() {
  const [language, setLanguage] = useState("en");
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
          <a className="nav-donate" href="#donate" onClick={() => setMenuOpen(false)}>{text.donate}</a>
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
            <button
              className={language === "en" ? "language-choice active" : "language-choice"}
              type="button"
              aria-pressed={language === "en"}
              onClick={() => setLanguage("en")}
            >
              English
            </button>
            <button
              className={language === "ta" ? "language-choice active" : "language-choice"}
              type="button"
              aria-pressed={language === "ta"}
              lang="ta"
              onClick={() => setLanguage("ta")}
            >
              தமிழ்
            </button>
          </div>
        </nav>
      </header>

      {authNotice && <p className="auth-notice" role="status">{authNotice}</p>}
      {authOpen && (
        <div className="auth-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setAuthOpen(false);
        }}>
          <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
            <button className="auth-close" type="button" aria-label="Close sign in" onClick={() => setAuthOpen(false)}>×</button>
            <div className="section-kicker"><span>✺</span><span>Arutperunjothi Trust</span></div>
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
            <p className="eyebrow"><span className="eyebrow-mark">✺</span>{text.eyebrow}</p>
            <h1>{text.title}</h1>
            <p className="hero-intro">{text.intro}</p>
            <div className="hero-actions">
              <a className="button button-gold" href="#donate">{text.donate}<span aria-hidden="true"> ↗</span></a>
              <a className="text-link" href="#about">{text.explore}<span aria-hidden="true"> →</span></a>
            </div>
            <p className="verification-note"><span aria-hidden="true">ⓘ</span> {text.note}</p>
          </div>
          <div className="hero-art">
            <div className="hero-art-disc"></div>
            <LotusLamp />
            <div className="hero-art-caption"><span>அருட்பெருஞ்ஜோதி</span><small>Light of grace</small></div>
          </div>
          <a className="scroll-cue" href="#about" aria-label="Scroll to learn about the trust"><span></span></a>
        </section>

        <section className="about section-wrap" id="about">
          <div className="section-kicker"><span>01</span><span>{text.aboutLabel}</span></div>
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
            <div className="section-kicker"><span>02</span><span>{text.servicesLabel}</span></div>
            <h2>{text.servicesTitle}</h2>
            <p>{text.servicesIntro}</p>
          </div>
          <div className="service-grid">
            {text.services.map(([title, description], index) => (
              <article className="service-card" key={title}>
                <div className={`service-icon icon-${index + 1}`} aria-hidden="true">
                  {index === 0 ? "◉" : index === 1 ? "✧" : "❋"}
                </div>
                <span className="service-number">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="impact section-wrap" id="impact">
          <div className="impact-heading">
            <div className="section-kicker light"><span>03</span><span>{text.impactLabel}</span></div>
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
            <div className="section-kicker"><span>04</span><span>{text.galleryLabel}</span></div>
            <h2>{text.galleryTitle}</h2>
            <p>{text.galleryIntro}</p>
          </div>
          <div className="gallery-grid" aria-label={text.galleryTitle}>
            {text.galleryItems.map((label, index) => (
              <figure className={`gallery-tile gallery-${index + 1}`} key={label}>
                <div className="gallery-art" aria-hidden="true">
                  <span className="gallery-sun"></span>
                  <span className="gallery-hill hill-one"></span>
                  <span className="gallery-hill hill-two"></span>
                  <span className="gallery-person person-one"></span>
                  <span className="gallery-person person-two"></span>
                  <span className="gallery-bowl"></span>
                </div>
                <figcaption><span>0{index + 1}</span>{label}</figcaption>
              </figure>
            ))}
          </div>
          <p className="gallery-disclaimer">{language === "ta" ? "இவை உண்மையான சேவைப் புகைப்படங்கள் அல்ல; விளக்கத்திற்கான வடிவங்கள்." : "Illustrative artwork only—not photographs of actual trust activities."}</p>
        </section>

        <section className="contact section-wrap" id="contact">
          <div className="contact-mark" aria-hidden="true">✺</div>
          <div>
            <div className="section-kicker"><span>05</span><span>{text.contactLabel}</span></div>
            <h2>{text.contactTitle}</h2>
            <p>{text.contactIntro}</p>
          </div>
          <div className="contact-placeholder">{text.contactCta}<span aria-hidden="true"> ↗</span></div>
        </section>

        <section className="donation section-wrap" id="donate">
          <div className="donation-copy">
            <div className="section-kicker"><span>06</span><span>{text.donationLabel}</span></div>
            <h2>{text.donationTitle}</h2>
            <p>{text.donationIntro}</p>
            <div className="payment-methods">
              <span>UPI</span><span>Debit / credit cards</span><span>Net banking</span>
            </div>
          </div>
          <form className="donation-form" onSubmit={submitDonation}>
            <fieldset disabled={!config.donations_enabled || loading}>
              <legend>{text.amount}</legend>
              <div className="amount-options">
                {["100", "250", "500", "1000"].map((value) => (
                  <label className={amount === value ? "amount-option selected" : "amount-option"} key={value}>
                    <input type="radio" name="amount" value={value} checked={amount === value} onChange={() => setAmount(value)} />
                    <span>₹{Number(value).toLocaleString("en-IN")}</span>
                  </label>
                ))}
                <label className={amount === "custom" ? "amount-option selected" : "amount-option"}>
                  <input type="radio" name="amount" value="custom" checked={amount === "custom"} onChange={() => setAmount("custom")} />
                  <span>{language === "ta" ? "மற்றவை" : "Other"}</span>
                </label>
              </div>
              {amount === "custom" && (
                <label className="field-label">
                  {text.custom}
                  <input required type="number" min="100" max="1000000" step="1" value={customAmount} onChange={(event) => setCustomAmount(event.target.value)} />
                </label>
              )}
              <label className="field-label">{text.name}
                <input required autoComplete="name" maxLength="100" value={donor.name} onChange={(event) => setDonor({ ...donor, name: event.target.value })} />
              </label>
              <label className="field-label">{text.email}
                <input required type="email" autoComplete="email" maxLength="254" value={donor.email} onChange={(event) => setDonor({ ...donor, email: event.target.value })} />
              </label>
              <label className="field-label">{text.phone}
                <input required type="tel" autoComplete="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength="10" placeholder="9876543210" value={donor.phone} onChange={(event) => setDonor({ ...donor, phone: event.target.value })} />
              </label>
              <button className="button button-brown payment-button" type="submit">
                {loading ? (language === "ta" ? "தயவுசெய்து காத்திருக்கவும்…" : "Please wait…") : text.donateSubmit}
                {!loading && <span aria-hidden="true"> →</span>}
              </button>
            </fieldset>
            <p className="form-status" role="status" aria-live="polite">
              {paymentMessage || (!config.donations_enabled ? text.paymentOff : text.secureNote)}
            </p>
            {orderId && (
              <div className={`payment-result ${paymentStatus === "PAID" ? "confirmed" : ""}`} role="status" aria-live="polite">
                <strong>{text.successTitle}</strong>
                <span>{paymentMessage || text.successPending}</span>
              </div>
            )}
          </form>
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

export default App;
