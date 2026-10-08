import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, BookOpen, CheckCircle2, Eye, EyeOff, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayCard } from "@/components/clay/ClayCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

type AuthMode = "login" | "signup";
type PreparationLevel = "Beginner" | "Intermediate" | "Advanced";
type StudyTime = "Less than 1 hour" | "1–2 hours" | "2–4 hours" | "4+ hours";

const studyTimes: StudyTime[] = ["Less than 1 hour", "1–2 hours", "2–4 hours", "4+ hours"];

function AuthShell({ mode, children }: { mode: AuthMode; children: ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-16 pt-8 sm:px-6 md:pt-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
      <section className="hidden lg:block" aria-label="UPSC Clay">
        <div className="mb-8 grid size-14 place-items-center rounded-[20px] bg-primary/25 text-primary-foreground shadow-[var(--clay-shadow-sm)]">
          <BookOpen className="size-7" aria-hidden="true" />
        </div>
        <p className="text-sm font-bold uppercase text-muted-foreground">UPSC Clay</p>
        <h2 className="mt-3 max-w-lg text-4xl font-extrabold leading-tight text-balance-tight">
          A steadier way to prepare for your next chapter.
        </h2>
        <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
          Keep your study goals, syllabus progress and practice journey together in one calm workspace.
        </p>
        <div className="mt-8 grid max-w-md gap-3 sm:grid-cols-2">
          <div className="clay-sm flex items-center gap-3 p-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary/60"><CheckCircle2 className="size-5 text-foreground" aria-hidden="true" /></span>
            <span className="text-sm font-semibold">Your progress, saved</span>
          </div>
          <div className="clay-sm flex items-center gap-3 p-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/50"><ShieldCheck className="size-5 text-foreground" aria-hidden="true" /></span>
            <span className="text-sm font-semibold">A private account</span>
          </div>
        </div>
      </section>
      <section className="mx-auto w-full max-w-xl" aria-labelledby="auth-heading">
        <div className="mb-5 flex items-center gap-2 lg:hidden">
          <span className="grid size-9 place-items-center rounded-xl bg-primary/25"><BookOpen className="size-5" aria-hidden="true" /></span>
          <span className="text-sm font-bold">UPSC Clay</span>
        </div>
        {children}
        <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <ShieldCheck className="size-4" aria-hidden="true" /> Your account is protected by secure sign-in.
        </p>
      </section>
    </div>
  );
}

function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-xs font-medium text-destructive" role="alert">{children}</p>;
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete,
  error,
  onBlur,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  error?: string;
  onBlur?: () => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="clay-inset min-h-12 w-full pr-12 pl-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-1 grid size-10 place-items-center self-center rounded-xl text-muted-foreground hover:bg-muted"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
      </div>
      {error ? <p id={`${id}-error`} className="mt-1 text-xs font-medium text-destructive" role="alert">{error}</p> : null}
    </div>
  );
}

function passwordStrength(password: string) {
  if (password.length < 8) return { label: "Weak", width: "w-1/3", tone: "bg-destructive" };
  const signals = [/[A-Z]/.test(password), /[a-z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  if (signals >= 3 && password.length >= 12) return { label: "Strong", width: "w-full", tone: "bg-success" };
  if (signals >= 2) return { label: "Medium", width: "w-2/3", tone: "bg-warning" };
  return { label: "Weak", width: "w-1/3", tone: "bg-destructive" };
}

function emailError(email: string) {
  if (!email.trim()) return "Please enter your email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Please enter a valid email address.";
  return "";
}

function safeReturnPath(redirectTo?: string): "/profile" | "/progress" | null {
  if (!redirectTo) return null;
  try {
    const parsed = new URL(redirectTo, window.location.origin);
    if (parsed.origin !== window.location.origin) return null;
    if (parsed.pathname === "/profile") return "/profile";
    if (parsed.pathname === "/progress") return "/progress";
  } catch {
    return null;
  }
  return null;
}

export function LoginScreen({ redirectTo }: { redirectTo?: string }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = { email: emailError(email), password: password ? "" : "Please enter your password." };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      if (remember) window.localStorage.setItem("upsc-clay-remembered-email", email.trim());
      else window.localStorage.removeItem("upsc-clay-remembered-email");
      toast.success("Welcome back");
      const returnPath = safeReturnPath(redirectTo);
      if (returnPath === "/profile") await navigate({ to: "/profile", replace: true });
      else if (returnPath === "/progress") await navigate({ to: "/progress", replace: true });
      else await navigate({ to: "/", replace: true });
    } catch {
      setErrors({ password: "We couldn't sign you in. Check your email and password and try again." });
    } finally {
      setBusy(false);
    }
  }

  async function googleSignIn() {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) throw result.error;
      if (!result.redirected) await navigate({ to: "/", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in is temporarily unavailable.");
      setBusy(false);
    }
  }

  return (
    <AuthShell mode="login">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase text-muted-foreground">Your study space</p>
        <h1 id="auth-heading" className="mt-2 text-3xl font-extrabold text-balance-tight sm:text-4xl">Welcome Back, Aspirant</h1>
        <p className="mt-2 text-sm text-muted-foreground">Continue your UPSC preparation journey.</p>
      </div>
      <ClayCard className="space-y-5 p-5 sm:p-7">
        <form onSubmit={submit} noValidate className="space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold">Email address</label>
            <input
              id="login-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => setErrors((current) => ({ ...current, email: emailError(email) }))}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "login-email-error" : undefined}
              className="clay-inset min-h-12 w-full px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            {errors.email ? <p id="login-email-error" className="mt-1 text-xs font-medium text-destructive" role="alert">{errors.email}</p> : null}
          </div>
          <PasswordInput id="login-password" label="Password" value={password} onChange={setPassword} autoComplete="current-password" error={errors.password} />
          <div className="flex min-h-10 flex-wrap items-center justify-between gap-2 text-sm">
            <label className="flex min-h-10 items-center gap-2 font-medium">
              <Checkbox checked={remember} onCheckedChange={(checked) => setRemember(checked === true)} aria-label="Remember me" />
              Remember me
            </label>
            <Link to="/forgot-password" className="min-h-10 content-center font-semibold text-primary-foreground underline underline-offset-4">Forgot Password?</Link>
          </div>
          <ClayButton type="submit" disabled={busy} className="w-full">
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null} Login
          </ClayButton>
        </form>
        <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or continue with<span className="h-px flex-1 bg-border" /></div>
        <ClayButton type="button" variant="ghost" disabled={busy} className="w-full" onClick={googleSignIn}>Continue with Google</ClayButton>
        <p className="text-center text-sm text-muted-foreground">Don't have an account? <Link to="/signup" className="font-bold text-foreground underline underline-offset-4">Create one</Link></p>
      </ClayCard>
    </AuthShell>
  );
}

export function SignupScreen() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [attemptYear, setAttemptYear] = useState("");
  const [level, setLevel] = useState<PreparationLevel | "">("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const strength = passwordStrength(password);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = "Please enter your full name.";
    const emailIssue = emailError(email);
    if (emailIssue) next.email = emailIssue;
    if (password.length < 8) next.password = "Password must contain at least 8 characters.";
    if (confirmPassword !== password) next.confirmPassword = "Passwords do not match.";
    if (!agreed) next.terms = "Please agree to the Terms of Service and Privacy Policy.";
    if (attemptYear && (!/^\d{4}$/.test(attemptYear) || Number(attemptYear) < new Date().getFullYear() || Number(attemptYear) > new Date().getFullYear() + 12)) {
      next.attemptYear = "Enter a valid target year.";
    }
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setNotice("");
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: fullName.trim(),
            attempt_year: attemptYear ? Number(attemptYear) : null,
            preparation_level: level || null,
          },
        },
      });
      if (error) throw error;
      if (!data.session) {
        setNotice("Check your email to confirm your account. Your profile details will be ready when you sign in.");
        return;
      }
      setNotice(`Welcome to UPSC Clay, ${fullName.trim()}!`);
      setStep(1);
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "We couldn't create your account. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  async function googleSignIn() {
    if (!agreed) {
      setErrors({ terms: "Please agree to the Terms of Service and Privacy Policy." });
      return;
    }
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) throw result.error;
      if (!result.redirected) await navigate({ to: "/", replace: true });
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Google sign-in is temporarily unavailable." });
      setBusy(false);
    }
  }

  const [step, setStep] = useState(0);
  const [onboardingYear, setOnboardingYear] = useState(attemptYear);
  const [onboardingLevel, setOnboardingLevel] = useState<PreparationLevel | "">(level);
  const [studyTime, setStudyTime] = useState<StudyTime | "">("");

  async function finishOnboarding() {
    setBusy(true);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setErrors({ form: "Please sign in again to finish setting up your profile." });
      setBusy(false);
      return;
    }
    const { error } = await supabase.from("profiles").update({
      attempt_year: onboardingYear ? Number(onboardingYear) : null,
      preparation_level: onboardingLevel || null,
      daily_study_time: studyTime || null,
    }).eq("id", userData.user.id);
    setBusy(false);
    if (error) {
      setErrors({ form: "Your account is ready, but we couldn't save your study preferences. You can add them from your profile." });
      return;
    }
    toast.success("Your UPSC Clay profile is ready");
    await navigate({ to: "/", replace: true });
  }

  if (step > 0) {
    return (
      <AuthShell mode="signup">
        <div className="mb-6">
          <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-success/35"><Sparkles className="size-6" aria-hidden="true" /></div>
          <h1 id="auth-heading" className="text-3xl font-extrabold text-balance-tight">{notice}</h1>
          <p className="mt-2 text-sm text-muted-foreground">A few details help us shape your study space around your goals.</p>
        </div>
        <ClayCard className="space-y-5 p-5 sm:p-7">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground"><span>Getting started</span><span>Step {step} of 3</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full bg-primary transition-all ${step === 1 ? "w-1/3" : step === 2 ? "w-2/3" : "w-full"}`} /></div>
          {step === 1 ? <div className="space-y-3"><label htmlFor="onboarding-year" className="block text-lg font-bold">What year are you targeting?</label><input id="onboarding-year" type="number" min={new Date().getFullYear()} max={new Date().getFullYear() + 12} value={onboardingYear} onChange={(event) => setOnboardingYear(event.target.value)} placeholder="e.g. 2027" className="clay-inset min-h-12 w-full px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary" /><p className="text-xs text-muted-foreground">You can change this anytime in your profile.</p></div> : null}
          {step === 2 ? <div className="space-y-3"><p className="text-lg font-bold">What's your current preparation level?</p><div className="grid gap-2 sm:grid-cols-3">{(["Beginner", "Intermediate", "Advanced"] as const).map((item) => <button key={item} type="button" aria-pressed={onboardingLevel === item} onClick={() => setOnboardingLevel(item)} className={`min-h-12 rounded-2xl border px-3 text-sm font-semibold transition-colors ${onboardingLevel === item ? "border-primary bg-primary/25" : "border-border bg-background hover:bg-muted"}`}>{item}</button>)}</div></div> : null}
          {step === 3 ? <div className="space-y-3"><p className="text-lg font-bold">How much time can you study each day?</p><div className="grid gap-2 sm:grid-cols-2">{studyTimes.map((item) => <button key={item} type="button" aria-pressed={studyTime === item} onClick={() => setStudyTime(item)} className={`min-h-12 rounded-2xl border px-3 text-sm font-semibold transition-colors ${studyTime === item ? "border-primary bg-primary/25" : "border-border bg-background hover:bg-muted"}`}>{item}</button>)}</div></div> : null}
          {errors.form ? <p className="text-sm font-medium text-destructive" role="alert">{errors.form}</p> : null}
          <div className="flex gap-3">
            {step > 1 ? <ClayButton type="button" variant="ghost" className="flex-1" onClick={() => setStep((current) => current - 1)}>Back</ClayButton> : null}
            {step < 3 ? <ClayButton type="button" className="flex-1" onClick={() => setStep((current) => current + 1)}>Continue <ArrowRight className="size-4" aria-hidden="true" /></ClayButton> : <ClayButton type="button" className="flex-1" disabled={busy} onClick={finishOnboarding}>{busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}Go to UPSC Clay</ClayButton>}
          </div>
        </ClayCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell mode="signup">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase text-muted-foreground">A new study routine starts here</p>
        <h1 id="auth-heading" className="mt-2 text-3xl font-extrabold text-balance-tight sm:text-4xl">Start Your UPSC Journey</h1>
        <p className="mt-2 text-sm text-muted-foreground">Create your free account and start preparing smarter every day.</p>
      </div>
      <ClayCard className="p-5 sm:p-7">
        <form onSubmit={submit} noValidate className="space-y-3.5">
          <div>
            <label htmlFor="signup-name" className="mb-1.5 block text-sm font-semibold">Full name</label>
            <input id="signup-name" value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" aria-invalid={Boolean(errors.fullName)} className="clay-inset min-h-12 w-full px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary" />
            <FieldError>{errors.fullName}</FieldError>
          </div>
          <div>
            <label htmlFor="signup-email" className="mb-1.5 block text-sm font-semibold">Email address</label>
            <input id="signup-email" type="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" aria-invalid={Boolean(errors.email)} className="clay-inset min-h-12 w-full px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary" />
            <FieldError>{errors.email}</FieldError>
          </div>
          <PasswordInput id="signup-password" label="Password" value={password} onChange={setPassword} autoComplete="new-password" error={errors.password} />
          <div className="-mt-1" aria-live="polite">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground"><span>Password strength</span><span>{password ? strength.label : "At least 8 characters"}</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full transition-all ${strength.width} ${strength.tone}`} /></div>
          </div>
          <PasswordInput id="signup-confirm" label="Confirm password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" error={errors.confirmPassword} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="signup-year" className="mb-1.5 block text-sm font-semibold">UPSC attempt year <span className="font-normal text-muted-foreground">(optional)</span></label>
              <input id="signup-year" type="number" min={new Date().getFullYear()} max={new Date().getFullYear() + 12} value={attemptYear} onChange={(event) => setAttemptYear(event.target.value)} placeholder="e.g. 2027" className="clay-inset min-h-12 w-full px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary" />
              <FieldError>{errors.attemptYear}</FieldError>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Preparation level <span className="font-normal text-muted-foreground">(optional)</span></label>
              <Select value={level} onValueChange={(value) => setLevel(value as PreparationLevel)}>
                <SelectTrigger className="clay-inset min-h-12 border-0"><SelectValue placeholder="Choose level" /></SelectTrigger>
                <SelectContent><SelectItem value="Beginner">Beginner</SelectItem><SelectItem value="Intermediate">Intermediate</SelectItem><SelectItem value="Advanced">Advanced</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="flex min-h-11 items-start gap-3 text-sm leading-6">
              <Checkbox checked={agreed} onCheckedChange={(checked) => { setAgreed(checked === true); setErrors((current) => ({ ...current, terms: "" })); }} aria-label="I agree to the Terms of Service and Privacy Policy" className="mt-1" />
              <span>I agree to the <Link to="/terms" className="font-semibold underline underline-offset-4">Terms of Service</Link> and <Link to="/privacy" className="font-semibold underline underline-offset-4">Privacy Policy</Link>.</span>
            </label>
            <FieldError>{errors.terms}</FieldError>
          </div>
          {notice ? <p className="rounded-2xl bg-success/25 p-3 text-sm font-medium" role="status">{notice}</p> : null}
          {errors.form ? <p className="text-sm font-medium text-destructive" role="alert">{errors.form}</p> : null}
          <ClayButton type="submit" disabled={busy} className="w-full">{busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}Create Account</ClayButton>
        </form>
        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or continue with<span className="h-px flex-1 bg-border" /></div>
        <ClayButton type="button" variant="ghost" disabled={busy} className="w-full" onClick={googleSignIn}>Continue with Google</ClayButton>
        <p className="mt-4 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-bold text-foreground underline underline-offset-4">Log in</Link></p>
      </ClayCard>
    </AuthShell>
  );
}

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [errorText, setErrorText] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const issue = emailError(email);
    setErrorText(issue);
    if (issue) return;
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
    setBusy(false);
    if (error) {
      setErrorText("We couldn't send a reset link just now. Please try again.");
      return;
    }
    setSent(true);
  }

  return (
    <AuthShell mode="login">
      <div className="mb-5"><p className="text-xs font-bold uppercase text-muted-foreground">Account access</p><h1 id="auth-heading" className="mt-2 text-3xl font-extrabold">Reset Your Password</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Enter your email address and we'll send you instructions to reset your password.</p></div>
      <ClayCard className="p-5 sm:p-7">
        {sent ? <p className="rounded-2xl bg-success/25 p-4 text-sm leading-6" role="status">If an account exists with this email, you will receive a password reset link.</p> : (
          <form onSubmit={submit} noValidate className="space-y-4">
            <div><label htmlFor="reset-email" className="mb-1.5 block text-sm font-semibold">Email address</label><input id="reset-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="clay-inset min-h-12 w-full px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary" />{errorText ? <p className="mt-1 text-xs font-medium text-destructive" role="alert">{errorText}</p> : null}</div>
            <ClayButton type="submit" disabled={busy} className="w-full">{busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}Send Reset Link</ClayButton>
          </form>
        )}
        <p className="mt-4 text-center text-sm text-muted-foreground"><Link to="/login" className="font-semibold underline underline-offset-4">Return to login</Link></p>
      </ClayCard>
    </AuthShell>
  );
}

export function ResetPasswordScreen() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useState(() => {
    const hasRecoveryType = typeof window !== "undefined" && new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery";
    setRecoveryReady(hasRecoveryType);
    setChecking(false);
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) { setMessage("Password must contain at least 8 characters."); return; }
    if (password !== confirmPassword) { setMessage("Passwords do not match."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { setMessage("This reset link may have expired. Request a new one and try again."); return; }
    toast.success("Your password has been updated");
    await supabase.auth.signOut();
    await navigate({ to: "/login", replace: true });
  }

  return (
    <AuthShell mode="login">
      <div className="mb-5"><p className="text-xs font-bold uppercase text-muted-foreground">Account access</p><h1 id="auth-heading" className="mt-2 text-3xl font-extrabold">Choose a new password</h1><p className="mt-2 text-sm text-muted-foreground">Use at least 8 characters to secure your account.</p></div>
      <ClayCard className="p-5 sm:p-7">
        {checking ? <p className="text-sm text-muted-foreground" role="status">Checking your reset link…</p> : !recoveryReady ? <div className="space-y-4"><p className="text-sm leading-6 text-muted-foreground">This reset link is no longer valid. Request a new link to continue.</p><ClayButton asChild className="w-full"><Link to="/forgot-password">Request a new reset link</Link></ClayButton></div> : (
          <form onSubmit={submit} className="space-y-4">
            <PasswordInput id="new-password" label="New password" value={password} onChange={setPassword} autoComplete="new-password" />
            <PasswordInput id="new-password-confirm" label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
            {message ? <p className="text-sm font-medium text-destructive" role="alert">{message}</p> : null}
            <ClayButton type="submit" disabled={busy} className="w-full">{busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}Update Password</ClayButton>
          </form>
        )}
      </ClayCard>
    </AuthShell>
  );
}