"use client";

type PaymentMethodCardProps = {
  method: string;
  cardName: string;
  cardNumber: string;
  paypalEmail: string;
  isPrimary: boolean;
  flipped: boolean;
  onFlip: () => void;
  onSetPrimary: () => void;
  onRemove: () => void;
};

function PrimaryControl({
  method,
  isPrimary,
  onSetPrimary,
}: {
  method: string;
  isPrimary: boolean;
  onSetPrimary: () => void;
}) {
  if (isPrimary) {
    return (
      <span className="inline-flex min-h-9 items-center rounded-lg bg-emerald-50 px-3 text-xs font-semibold text-emerald-700">
        Primary payment method
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-label={`Set ${method} as primary payment method`}
      onClick={(event) => {
        event.stopPropagation();
        onSetPrimary();
      }}
      className="min-h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#e65d00] focus:outline-none focus:ring-2 focus:ring-primary/30"
    >
      Set as primary
    </button>
  );
}

export default function PaymentMethodCard({
  method,
  cardName,
  cardNumber,
  paypalEmail,
  isPrimary,
  flipped,
  onFlip,
  onSetPrimary,
  onRemove,
}: PaymentMethodCardProps) {
  const isCard = method === "Credit Card";
  const frontBackground = isCard
    ? "from-[#5b4bd8] via-[#4431a9] to-[#24175f]"
    : "from-[#0879b9] via-[#075b9d] to-[#06366b]";
  const backBackground = isCard
    ? "from-[#24175f] to-[#4431a9]"
    : "from-[#06366b] to-[#075b9d]";

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={`${flipped ? "Show front of" : "Flip"} ${method} card`}
        onClick={onFlip}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") onFlip();
        }}
        className="relative aspect-[1.586/1] w-full max-w-3xl cursor-pointer [perspective:1000px]"
      >
      <div
        className={`relative h-full w-full ${
          flipped ? "animate-card-flip" : "animate-card-flip-back"
        }`}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className={`absolute inset-0 overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-lg sm:p-7 ${frontBackground}`}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full border-[22px] border-white/10" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between gap-3 text-left">
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/70">
                  {isCard ? "Card Holder" : "PayPal account"}
                </p>
                <p className="mt-1 truncate text-xs font-semibold sm:text-sm">
                  {isCard ? cardName : paypalEmail}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Remove ${method}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove();
                }}
                className="shrink-0 rounded-md bg-white/10 px-2 py-1 text-[10px] text-white/80 transition hover:bg-white/20 hover:text-white"
              >
                Remove
              </button>
            </div>
            {isCard ? (
              <>
                <p className="mt-6 text-base font-semibold tracking-[0.16em] sm:text-xl sm:tracking-[0.2em]">
                  {cardNumber}
                </p>
                <div className="flex flex-wrap items-end justify-between gap-2 text-[9px] text-white/70">
                  <span>VISA</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-white sm:text-xs">
                      Tap to flip
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="mt-6 text-2xl font-bold italic sm:text-3xl">
                  PayPal
                </p>
                <div className="flex flex-wrap items-end justify-between gap-2 text-[9px] text-white/70">
                  <span>Verified account</span>
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[10px] font-bold text-white sm:text-xs">
                      Tap to flip
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div
          className={`absolute inset-0 flex flex-col items-start justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-left text-white shadow-lg sm:p-7 ${backBackground}`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/70">
              Payment details
            </p>
            <p className="mt-3 text-sm font-semibold">
              {isCard ? "Secure card payment" : "Verified PayPal account"}
            </p>
            <p className="mt-2 max-w-sm text-[11px] leading-5 text-white/75">
              Used by buyers to complete purchases. Payment data is protected by
              the platform.
            </p>
          </div>
          <p className="text-[10px] font-semibold text-white/80">
            Tap to flip back
          </p>
        </div>
      </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-[#e5e9f2] bg-white px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-[#33405d]">{method}</p>
          <p className="mt-0.5 truncate text-[9px] text-[#8993aa]">
            {isPrimary ? "Used by default for payments" : "Use this method by default"}
          </p>
        </div>
        <PrimaryControl method={method} isPrimary={isPrimary} onSetPrimary={onSetPrimary} />
      </div>
    </>
  );
}
