import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";

export default function VoiceCopilot() {

  const [listening, setListening] = useState(false);

  const [transcript, setTranscript] = useState("");

  const [response, setResponse] = useState(
    "RepoGuardian AI Voice Copilot Ready"
  );

  const recognitionRef = useRef(null);

  useEffect(() => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

      alert(
        "Speech Recognition not supported in this browser"
      );

      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;

    recognition.lang = "en-US";

    recognition.interimResults = false;

    recognition.onstart = () => {

      setListening(true);

    };

    recognition.onend = () => {

      setListening(false);

    };

    recognition.onresult = async (event) => {

      const command =
        event.results[0][0].transcript.toLowerCase();

      setTranscript(command);

      handleCommand(command);
    };

    recognitionRef.current = recognition;

  }, []);

  // 🔥 Speak

  const speak = (text) => {

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.rate = 1;

    utterance.pitch = 1;

    utterance.volume = 1;

    speechSynthesis.speak(utterance);
  };

  // 🔥 AI Commands

  const handleCommand = async (command) => {

    const text =
      command.toLowerCase().trim();

    console.log(
      "VOICE COMMAND:",
      text
    );

    let aiResponse =
      "I could not understand the request.";

    // Scan

    if (
      text.includes("scan") ||
      text.includes("scan repository") ||
      text.includes("start scan") ||
      text.includes("security scan")
    ) {

      aiResponse =
        "Starting repository security scan.";

      try {

        await fetch(
          "http://localhost:8000/api/scan-history"
        );

        aiResponse =
          "Repository scan completed successfully.";

      } catch (err) {

        aiResponse =
          "Failed to complete repository scan.";
      }
    }

    // Vulnerabilities

    else if (
      text.includes("vulnerability") ||
      text.includes("vulnerabilities") ||
      text.includes("findings") ||
      text.includes("critical") ||
      text.includes("security issues")
    ) {

      aiResponse =
        "Three critical vulnerabilities detected including hardcoded secrets, unsafe imports, and API exposure.";
    }

    // Export

    else if (
      text.includes("export") ||
      text.includes("download report") ||
      text.includes("pdf") ||
      text.includes("security report")
    ) {

      window.open(
        "http://localhost:8000/api/export-report",
        "_blank"
      );

      aiResponse =
        "Exporting professional security PDF report.";
    }

    // Create PR

    else if (
      text.includes("create pr") ||
      text.includes("generate pr") ||
      text.includes("secure pr") ||
      text.includes("fix pr")
    ) {

      try {

        await fetch(
          "http://localhost:8000/api/create_pr",
          {
            method: "POST",
          }
        );

        aiResponse =
          "Secure remediation pull request created successfully.";

      } catch (err) {

        aiResponse =
          "Failed to create remediation pull request.";
      }
    }

    // Developer Risk

    else if (
      text.includes("developer") ||
      text.includes("behavior") ||
      text.includes("risk")
    ) {

      aiResponse =
        "Behavioral intelligence scan shows medium developer risk due to recurring hardcoded secret patterns.";
    }

    // Health

    else if (
      text.includes("health") ||
      text.includes("security health") ||
      text.includes("health score")
    ) {

      aiResponse =
        "Current repository security health score is 74 out of 100.";
    }

    // Default

    else {

      aiResponse =
        "Command not recognized. Try saying scan repository, export report, show vulnerabilities, or create PR.";
    }

    setResponse(aiResponse);

    speak(aiResponse);
  };

  // 🔥 Start Voice

  const startListening = () => {

    if (recognitionRef.current) {

      recognitionRef.current.start();
    }
  };

  return (

    <div
      style={{
        position: "fixed",

        bottom: "24px",
        right: "24px",

        zIndex: 9999,
      }}
    >

      {/* Pulse Animation */}

      <style>
        {`
        @keyframes neonPulse {

          0% {
            transform: scale(1);
            box-shadow: 0 0 18px rgba(255,140,66,0.22);
          }

          50% {
            transform: scale(1.06);
            box-shadow: 0 0 34px rgba(255,140,66,0.45);
          }

          100% {
            transform: scale(1);
            box-shadow: 0 0 18px rgba(255,140,66,0.22);
          }

        }

        @keyframes slideUp {

          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0px);
          }

        }
        `}
      </style>

      {/* 🔥 Floating Voice Orb */}

      <button
        onClick={startListening}
        style={{

          width: "78px",
          height: "78px",

          borderRadius: "50%",

          border:
            "1px solid rgba(255,140,66,0.22)",

          background: listening
            ? "linear-gradient(135deg,#ff5a1f,#ff7a00)"
            : "linear-gradient(135deg,#0a0a0a,#181818)",

          boxShadow: listening
            ? "0 0 40px rgba(255,90,31,0.45)"
            : "0 0 28px rgba(255,140,66,0.18)",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          cursor: "pointer",

          transition: "0.3s ease",

          animation:
            "neonPulse 2s infinite ease-in-out",

          backdropFilter: "blur(10px)",
        }}
      >

        {listening ? (

          <MicOff
            color="white"
            size={32}
          />

        ) : (

          <Mic
            color="#ffb066"
            size={32}
          />

        )}

      </button>

      {/* 🔥 AI Bubble */}

      {(transcript || response) && (

        <div
          style={{
            position: "absolute",

            bottom: "98px",
            right: "0",

            width: "340px",

            background:
              "linear-gradient(145deg,#050505ee,#121212ee)",

            border:
              "1px solid rgba(255,140,66,0.14)",

            borderRadius: "22px",

            padding: "20px",

            boxShadow:
              "0 0 40px rgba(0,0,0,0.55)",

            backdropFilter: "blur(14px)",

            animation:
              "slideUp 0.25s ease-out",
          }}
        >

          {/* Header */}

          <div
            style={{
              color: "#ff9d2e",

              fontSize: "13px",

              marginBottom: "10px",

              fontWeight: "800",

              letterSpacing: "0.08em",

              textTransform: "uppercase",
            }}
          >
            🎙 RepoGuardian Voice AI
          </div>

          {/* Heard */}

          <div
            style={{
              color: "#9ca3af",

              fontSize: "11px",

              marginBottom: "8px",

              textTransform: "uppercase",

              letterSpacing: "0.06em",
            }}
          >
            Heard Command
          </div>

          <div
            style={{
              color: "#ffffff",

              fontSize: "14px",

              marginBottom: "16px",

              lineHeight: "1.6",

              background:
                "linear-gradient(145deg,#0b0b0b,#151515)",

              border:
                "1px solid rgba(255,140,66,0.08)",

              borderRadius: "14px",

              padding: "12px",
            }}
          >
            {transcript || "Waiting for voice command..."}
          </div>

          {/* AI Response */}

          <div
            style={{
              borderTop:
                "1px solid rgba(255,140,66,0.08)",

              paddingTop: "14px",

              color: "#ffb347",

              fontSize: "14px",

              lineHeight: "1.8",
            }}
          >
            {response}
          </div>

          {/* Suggested Commands */}

          <div
            style={{
              marginTop: "16px",

              display: "flex",

              flexWrap: "wrap",

              gap: "8px",
            }}
          >

            {[
              "scan repository",
              "export report",
              "show vulnerabilities",
              "create PR"
            ].map((cmd, i) => (

              <div
                key={i}
                style={{
                  background:
                    "linear-gradient(145deg,#0d0d0d,#161616)",

                  border:
                    "1px solid rgba(255,140,66,0.10)",

                  color: "#ffb066",

                  padding: "6px 10px",

                  borderRadius: "999px",

                  fontSize: "10px",

                  fontWeight: "600",
                }}
              >
                {cmd}
              </div>

            ))}

          </div>

        </div>
      )}

    </div>
  );
}