
import { useState } from "react";
import { api } from "../../api/ctfApi";
import styles from "../../styles/CtfHome.module.css";

import CyberButton from "../../components/CyberButton";
import PlayIcon from "../../components/Icons/PlayIcon";


const EMPTY_MEMBER = {
  name: "",
  profession: "",
  gender: ""
};

export default function RegisterView({switchToTeam}) {

  const [showPassword, setShowPassword] = useState(false);

  const [teamName, setTeamName] = useState("");
  const [teamPassword, setTeamPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [masterKey, setMasterKey] = useState("");
  

  const [members, setMembers] = useState([
    { ...EMPTY_MEMBER },
    { ...EMPTY_MEMBER },
    { ...EMPTY_MEMBER },
    { ...EMPTY_MEMBER }
  ]);

  const [msg, setMsg] = useState("");
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  function setMember(index, field, value) {
  setMembers(prev =>
    prev.map((m, i) =>
      i === index
        ? { ...m, [field]: value }
        : m
    )
  );

}

 async function copyCreds() {
  const text = `Team ID: ${created.teamId}\nPasskey: ${created.passkey}`;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  } catch {
    setCopied(false);
  }
}

  async function submit() {

    setMsg("");

    const d = await api.teamRegister({
      teamName,
      teamPassword,
      orgName,
      masterKey,
      members
    });

    if (d?.success) {
      setCreated({
        teamId: d.teamId,
        passkey: d.passkey
      });
    } else {
      setMsg(d?.message || "Registration failed");
    }
  }

  if (created) {
    return (
      <>
        <div className={styles.formTitle}>
          TEAM CREATED SUCCESSFULLY
        </div>

        <div className={styles.formTagline}>
        // save these credentials carefully //
      </div>

        <div className={styles.fieldGroup}>
         
          <div className={styles.field}>
            <div className={styles.fieldLabel}>
              TEAM ID
            </div>
            <div className={styles.fieldWrap}>
            <input
              className={styles.fieldInput}
              value={created.teamId}
              readOnly
            />
          </div>
          </div>
        
          <div className={styles.field}>
            <div className={styles.fieldLabel}>
              PASSKEY
            </div>
            <div className={styles.fieldWrap}>
                <input
                  className={styles.fieldInput}
                  value={created.passkey}
                  readOnly
                />
            </div>
          </div>

         <div className={styles.formTagline}>
        // save these credentials carefully //
      </div>

        </div>

        <CyberButton
        onClick={copyCreds}
        variant="primary"
        size="small"
        icon={<PlayIcon />}
      >
        {copied ? "COPIED ✓" : "COPY CREDENTIALS"}
      </CyberButton>

      <div className={styles.switchRow}>
        Ready to login?{" "}
        <span
          className={styles.switchLink}
          onClick={switchToTeam}
        >
          SIGN IN ►
        </span>
      </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.terminalLine}>
        <span className={styles.prompt}>$</span>
        ./register_team.sh
      </div>

      <div className={styles.formTitle}>
        NEW TEAM REGISTRATION
      </div>

      <div className={styles.formTagline}>
        // create a new team //
      </div>

      <div className={styles.fieldGroup}>

        <div className={styles.field}>
          <div className={styles.fieldLabel}>
            TEAM NAME <span className={styles.req}>*</span>
          </div>
         
         <div className={styles.fieldWrap}>
            <span className={styles.fieldIcon}>◈</span>
          <input
            className={styles.fieldInput}
            placeholder="Enter team username"
            value={teamName}
            onChange={(e)=>setTeamName(e.target.value)}
          />
        </div>
        </div>

    
         <div className={styles.field}>
          <div className={styles.fieldLabel}>
            PASSWORD <span className={styles.req}>*</span>
          </div>

          <div className={styles.fieldWrap}>
            <span className={styles.fieldIcon}>■</span>

            <input
              type={showPassword ? "text" : "password"}
              className={styles.fieldInput}
              placeholder="Enter team password"
              value={teamPassword}
              onChange={(e)=>setTeamPassword(e.target.value)}
            />

            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? "🙈" : "👁"}
            </button>

          </div>
          
        </div>

        <div className={styles.field}>
          <div className={styles.fieldLabel}>
            ORGANIZATION <span className={styles.req}>*</span>
          </div>

        <div className={styles.fieldWrap}>
            <span className={styles.fieldIcon}>🏢 </span>
          <input
            className={styles.fieldInput}
            value={orgName}
            placeholder="College / company name"
            onChange={(e)=>setOrgName(e.target.value)}
          />
        </div>
        </div>

       

        {members.map((member, i) => (

  <div key={i}>

    <div className={styles.regSectionLabel}>
      MEMBER {i + 1}
      
      {i <= 1 && (
        <span>
          (REQUIRED)
        </span>
      )}


      {i > 1 && (
        <span className={styles.optTag}>
          OPTIONAL
        </span>
      )}

    </div>

    <div className={styles.memberRow}>

      {/* NAME */}
      <input
        className={styles.memberInput}
        placeholder="Name"
        value={member.name}
        onChange={(e) =>
          setMember(i, "name", e.target.value)
        }
      />

      {/* PROFESSION */}
      <input
        className={styles.memberInput}
        placeholder="Profession"
        value={member.profession}
        onChange={(e) =>
          setMember(i, "profession", e.target.value)
        }
      />

      {/* GENDER */}
      <div className={styles.memberSelectWrap}>

        <select
          className={styles.memberSelect}
          value={member.gender}
          onChange={(e) =>
            setMember(i, "gender", e.target.value)
          }
        >
          <option value="">Gender</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>

        <span className={styles.memberSelectArrow}>
          ▼
        </span>

      </div>

    </div>

  </div>

))}

        <div className={styles.field}>
          <div className={styles.fieldLabel}>
            MASTER KEY
          </div>
         
         <div className={styles.fieldWrap}>
            <span className={styles.fieldIcon}>🔑</span>
          <input
            className={styles.fieldInput}
            value={masterKey}
            placeholder="Collect your Key from admin" 
            onChange={(e)=>setMasterKey(e.target.value)}
          />
        </div>
        </div>

      </div>


        <CyberButton
          onClick={submit}
          variant="primary"
          size="small"
          icon={<PlayIcon />}
        >
           REGISTER TEAM
        </CyberButton>

      {msg && (
        <div className={styles.errorMsg}>
          {msg}
        </div>
      )}

      <div className={styles.switchRow}>
                Already have a team?{" "}
                <span 
                 class={styles.switchLink} 
                 onClick={switchToTeam}>
                  SIGN IN ►
                </span>
              </div>

    </>
  );
}

