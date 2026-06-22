
import { useState } from "react";
import { api } from "../../api/ctfApi";
import styles from "../../styles/CtfHome.module.css";

import CyberButton from "../../components/CyberButton";
import PlayIcon from "../../components/Icons/PlayIcon";

export default function AdminView({ onDone, switchToTeam, switchToRegister}) {
  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function submit() {
    setMsg("");

    const d = await api.adminLogin(username, password);

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
        ./admin_login.sh --secure
        <span className={styles.cursor}></span>
      </div>

      <div className={styles.formTitle}>
        ADMIN LOGIN
      </div>

      <div className={styles.formTagline}>
        // access the admin dashboard //
      </div>

      <div className={styles.fieldGroup}>

        {/* USERNAME */}
        <div className={styles.field}>

          <div className={styles.fieldLabel}>
            ADMIN USERNAME <span className={styles.req}>*</span>
          </div>

          <div className={styles.fieldWrap}>
            <span className={styles.fieldIcon}>◈</span>

            <input
              className={styles.fieldInput}
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

        </div>

        {/* PASSWORD */}
        <div className={styles.field}>

          <div className={styles.fieldLabel}>
            PASSWORD <span className={styles.req}>*</span>
          </div>

          <div className={styles.fieldWrap}>
            <span className={styles.fieldIcon}>■</span>

            <input
              type={showPassword ? "text" : "password"}
              className={styles.fieldInput}
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

        </div>

      </div>

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
          Not an admin?{" "}
          <span 
           class={styles.switchLink} 
           onClick={switchToTeam}>
            TEAM LOGIN ►
          </span>
        </div>
    </>
  );
}


