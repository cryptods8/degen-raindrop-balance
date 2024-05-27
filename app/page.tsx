import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "$DEGEN RainDrop Balance Checker",
    description: "Checks the $DEGEN RainDrop Balance of the caster",
  };
}

export default async function Home() {
  return (
    <div
      style={{
        display: "flex",
        height: "100dvh",
        width: "100vw",
        backgroundColor: "black",
        color: "white",
        alignItems: "center",
        justifyContent: "center",
        whiteSpace: "pre-wrap",
      }}
    >
      <div>
        $DEGEN RainDrop Balance Checker by{" "}
        <a
          href="https://warpcast.com/ds8"
          target="_blank"
          rel="noopener noreferrer"
        >
          ds8
        </a>
      </div>
    </div>
  );
}
