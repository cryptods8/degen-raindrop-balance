import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "$DEGEN RainDrop Balance Checker",
    description: "Checks the $DEGEN RainDrop Balance of the caster",
  };
}

function constructCastActionUrl(params: { url: string }): string {
  // Construct the URL
  const baseUrl = "https://warpcast.com/~/add-cast-action";
  const urlParams = new URLSearchParams({
    url: params.url,
  });

  return `${baseUrl}?${urlParams.toString()}`;
}

export default async function Home() {
  const installUrl = constructCastActionUrl({
    url: `${
      process.env.NEXT_PUBLIC_HOST ?? "http://localhost:3000"
    }/api/actions/balance`,
  });
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
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
      <div>
        <a
          style={{
            display: "inline-block",
            padding: "0.75rem 1.25rem",
            border: "1px solid white",
            borderRadius: "0.25rem",
            textDecoration: "none",
            color: "white",
            fontWeight: 600,
          }}
          href={installUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Install
        </a>
      </div>
    </div>
  );
}
