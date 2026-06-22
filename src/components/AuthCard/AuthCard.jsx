
import { useState } from "react";

import styles from "../../styles/CtfHome.module.css";

import AdminView from "./AdminView";
import TeamLoginView from "./TeamLoginView";
import RegisterView from "./RegisterView";

export default function AuthCard({
  onAdminSuccess,
  onTeamSuccess
}) {

  const [activeTab, setActiveTab] = useState("admin");

  return (
    <div className={styles.authWrap}>

      <div className={styles.authCard}>

        {/* PIXEL CORNERS */}
        <div className={styles.cBl}></div>
        <div className={styles.cBr}></div>

        {/* HEADER */}
        <div className={styles.cardHd}>

          <div className={styles.cardHdLeft}>
            <div className={styles.brandMiniName}>
              CRUCIBLE
            </div>
          </div>

          <div className={styles.hdDots}>
            <div className={`${styles.hdDot} ${styles.g}`}></div>
            <div className={`${styles.hdDot} ${styles.a}`}></div>
            <div className={`${styles.hdDot} ${styles.r}`}></div>
          </div>

        </div>

        {/* TAB STRIP */}
        <div className={styles.tabStrip}>

          <button
            className={`${styles.tabBtn} ${
              activeTab === "admin"
                ? styles.active
                : ""
            }`}
            onClick={() => setActiveTab("admin")}
          >
            [ ADMIN ]
          </button>

          <button
            className={`${styles.tabBtn} ${
              activeTab === "team"
                ? styles.active
                : ""
            }`}
            onClick={() => setActiveTab("team")}
          >
            [ TEAM LOGIN ]
          </button>

          <button
            className={`${styles.tabBtn} ${
              activeTab === "register"
                ? styles.active
                : ""
            }`}
            onClick={() => setActiveTab("register")}
          >
            [ REGISTER ]
          </button>

        </div>

        {/* BODY */}
        {/* BODY */}
<div className={styles.cardBody}>

  {activeTab === "admin" && (
    <AdminView
      onDone={onAdminSuccess}
      switchToTeam={() => setActiveTab("team")}
      switchToRegister={() => setActiveTab("register")}
    />
  )}

  {activeTab === "team" && (
    <TeamLoginView
      onDone={onTeamSuccess}
      switchToAdmin={() => setActiveTab("admin")}
      switchToRegister={() => setActiveTab("register")}
    />
  )}

  {activeTab === "register" && (
    <RegisterView
      switchToAdmin={() => setActiveTab("admin")}
      switchToTeam={() => setActiveTab("team")}
    />
  )}

</div>

      </div>

    </div>
  );
}

