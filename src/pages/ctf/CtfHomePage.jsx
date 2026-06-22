import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../../api/ctfApi";
import { useReveal } from "../../animations/useReveal";

import styles from "../../styles/CtfHome.module.css";

import AuthCard from "../../components/AuthCard/AuthCard";
import CyberButton from "../../components/CyberButton";
import PlayIcon from "../../components/Icons/PlayIcon";

export default function CtfHomePage() {

  const navigate = useNavigate();
  const rootRef = useRef(null);

  useReveal(rootRef);

  // Already logged in?
  useEffect(() => {

    api.me().then((d) => {

      if (d?.role === "admin") {

        navigate("/ctf/admin");

      } else if (d?.role === "team") {

        navigate("/ctf/play");

      }

    });

  }, [navigate]);

  return (

    <div
      className={styles.page}
      ref={rootRef}
    >

      {/* HEADER */}
      <div className={styles.ctfHeader}>

        <div className={styles.headerLeft}>

          <div
            className={styles.label}
            data-glitch
          >
            LEVEL 4 CTF CHALLENGE PORTAL
          </div>

          <div className={styles.title}>
            Welcome to the final challenge.
          </div>

        </div>

        <div className={styles.headerRight}>

          <CyberButton
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={() => navigate("/")}
            icon={
              <PlayIcon
                style={{
                  transform: "rotate(180deg)"
                }}
              />
            }
          >
            BACK
          </CyberButton>

        </div>

      </div>

      {/* AUTH SECTION */}
      <div className={styles.authSection}>

        <AuthCard
          onAdminSuccess={() => navigate("/ctf/admin")}
          onTeamSuccess={() => navigate("/ctf/play")}
        />

      </div>

    </div>

  );

}