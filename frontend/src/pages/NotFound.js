import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SplitText, Magnetic } from "../components/motion";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-screen flex-col justify-center pb-16 pt-28">
      <p className="eyebrow mb-6">Error 404</p>
      <h1 className="display text-[22vw] leading-[0.8] md:text-[16vw]">
        <SplitText lines={["Wrong", "turn."]} lineClassName="[&:last-child]:text-muted" />
      </h1>
      <div className="mt-10 flex flex-col gap-6 border-t border-line/10 pt-8 md:flex-row md:items-center md:justify-between">
        <p className="max-w-md text-muted">
          This road doesn&apos;t go anywhere. Head back and pick another route.
        </p>
        <Magnetic>
          <Link to="/" className="btn-primary">
            Back to home <ArrowUpRight size={16} />
          </Link>
        </Magnetic>
      </div>
    </div>
  );
}
