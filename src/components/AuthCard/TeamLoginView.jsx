import { useState } from "react";
import { api } from "../../api/ctfApi";
import styles from "../../styles/CtfHome.module.css";

import CyberButton from "../../components/CyberButton";
import PlayIcon from "../../components/Icons/PlayIcon";

export default function TeamLoginView({ onDone, switchToAdmin, switchToRegister }) {
  const [showPassword, setShowPassword] = useState(false);

  const [method, setMethod] = useState("password");
  const [teamId, setTeamId] = useState("");
  const [secret, setSecret] = useState("");
  const [msg, setMsg] = useState("");

  async function submit() {
    setMsg("");

    const d =
      method === "password"
        ? await api.teamLoginPassword(teamId, secret)
        : await api.teamLoginPasskey(teamId, secret);

    if (d?.success) {
      onDone();
    } else {
      setMsg(d?.message || "Login failed");
    }
  }

  return (
    <>
      <div className={styles.terminalLine}>
        <span className={styles.prompt}>$</span>
        ./team_login.sh --secure
      </div>

      <div className={styles.formTitle}>
        TEAM LOGIN
      </div>

      <div className={styles.formTagline}>
        // access your team workspace //
      </div>

      {/* PASSWORD / PASSKEY TOGGLE */}
      <div className={styles.modeSwitch}>
        <button
          className={`${styles.modeBtn} ${
            method === "password" ? styles.activeMode : ""
          }`}
          onClick={() => {
            setMethod("password");
            setSecret("");
          }}
        >
          ■ PASSWORD
        </button>

        <button
          className={`${styles.modeBtn} ${
            method === "passkey" ? styles.activeMode : ""
          }`}
          onClick={() => {
            setMethod("passkey");
            setSecret("");
          }}
        >
          🔑 PASSKEY
        </button>
      </div>

      <div className={styles.fieldGroup}>
        {/* TEAM ID */}
        <div className={styles.field}>
          <div className={styles.fieldLabel}>
            TEAM ID <span className={styles.req}>*</span>
          </div>

          <div className={styles.fieldWrap}>
            <span className={styles.fieldIcon}>◈</span>

            <input
              className={styles.fieldInput}
              placeholder="TEAM-001"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
            />
          </div>
        </div>

        {/* PASSWORD / PASSKEY */}
        <div className={styles.field}>
          <div className={styles.fieldLabel}>
            {method === "password" ? "PASSWORD" : "PASSKEY"}{" "}
            <span className={styles.req}>*</span>
          </div>

          <div className={styles.fieldWrap}>
            <span className={styles.fieldIcon}>
              {method === "password" ? "■" : "🔑"}
            </span>

            <input
              type={
                method === "password"
                  ? showPassword
                    ? "text"
                    : "password"
                  : "text"
              }
              className={styles.fieldInput}
              placeholder={
                method === "password"
                  ? "Enter password"
                  : "Enter passkey"
              }
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />

            {method === "password" && (
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PASSKEY MESSAGE BOX */}
      {method === "passkey" && (
        <div className={styles.passkeyBox}>
          <div className={styles.passkeyIcon}>🔑</div>

          <div className={styles.passkeyText}>
            PASSKEY AUTHENTICATION
          </div>

          <div className={styles.passkeySub}>
            Use your Team ID and the Passkey generated during registration.
            Save your passkey carefully — it is required for secure access.
          </div>
        </div>
      )}

      <CyberButton
        onClick={submit}
        variant="primary"
        size="small"
        icon={<PlayIcon />}
      >
        LOGIN
      </CyberButton>

      {msg && (
        <div className={styles.errorMsg}>
          {msg}
        </div>
      )}

      <div className={styles.switchRow}>
                No team yet?{" "}
                <span 
                 class={styles.switchLink} 
                 onClick={switchToRegister}>
                  REGISTER ►
                </span>
        </div>
    </>
  );
}