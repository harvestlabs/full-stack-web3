import "../styles/globals.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AccountContext, KontourContext } from "../context.js";
import { useRouter } from "next/router";
import { css } from "@emotion/css";
import "easymde/dist/easymde.min.css";

function MyApp({ Component, pageProps }) {
  const [account, setAccount] = useState("");
  const [owner, setOwner] = useState("");
  const [kontour, setKontour] = useState(null);
  const router = useRouter();

  /* eslint-disable @next/next/no-sync-scripts*/
  useEffect(() => {
    if (router.query.sdk) {
      localStorage.setItem("kontour-sdk", router.query.sdk);
    }
    const maybeSdk = localStorage.getItem("kontour-sdk");
    if (maybeSdk) {
      const s = document.createElement("script");
      s.type = "text/javascript";
      s.src = `http://localhost:8080/sdk/${maybeSdk}`;
      document.body.appendChild(s);
    }
  }, [router.query.sdk]);

  useEffect(() => {
    async function setup() {
      if (kontour) {
        const account = await kontour?.wallets?.requestMetamaskAccounts();
        if (account) {
          setAccount(account.toLowerCase());
        }
        const owner = await kontour.contracts.Blog.view.owner();
        setOwner(owner.toLowerCase());
      }
    }
    document.addEventListener("KONTOUR_CONTRACTS_LOADED", () => {
      setKontour(window?.kontour);
    });
    setup();
  }, [kontour]);

  return (
    <div>
      <nav className={nav}>
        <div className={header}>
          <Link href="/">
            <a>
              <img src="/logo.svg" alt="React Logo" style={{ width: "50px" }} />
            </a>
          </Link>
          <Link href="/">
            <a>
              <div className={titleContainer}>
                <h2 className={title}>Full Stack</h2>
                <p className={description}>WEB3</p>
              </div>
            </a>
          </Link>
          {account && <p className={accountInfo}>{account}</p>}
        </div>
        <div className={linkContainer}>
          <Link href="/">
            <a className={link}>Home</a>
          </Link>
          {
            /* if the signed in user is the contract owner, we */
            /* show the nav link to create a new post */
            account === owner && (
              <Link href="/create-post">
                <a className={link}>Create Post</a>
              </Link>
            )
          }
        </div>
      </nav>
      <div className={container}>
        <KontourContext.Provider value={kontour}>
          <AccountContext.Provider value={{ account, owner }}>
            <Component {...pageProps} />
          </AccountContext.Provider>
        </KontourContext.Provider>
      </div>
    </div>
  );
}

const accountInfo = css`
  width: 100%;
  display: flex;
  flex: 1;
  justify-content: flex-end;
  font-size: 12px;
`;

const container = css`
  padding: 40px;
`;

const linkContainer = css`
  padding: 30px 60px;
  background-color: #fafafa;
`;

const nav = css`
  background-color: white;
`;

const header = css`
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, 0.075);
  padding: 20px 30px;
`;

const description = css`
  margin: 0;
  color: #999999;
`;

const titleContainer = css`
  display: flex;
  flex-direction: column;
  padding-left: 15px;
`;

const title = css`
  margin-left: 30px;
  font-weight: 500;
  margin: 0;
`;

const buttonContainer = css`
  width: 100%;
  display: flex;
  flex: 1;
  justify-content: flex-end;
`;

const buttonStyle = css`
  background-color: #fafafa;
  outline: none;
  border: none;
  font-size: 18px;
  padding: 16px 70px;
  border-radius: 15px;
  cursor: pointer;
  box-shadow: 7px 7px rgba(0, 0, 0, 0.1);
`;

const link = css`
  margin: 0px 40px 0px 0px;
  font-size: 16px;
  font-weight: 400;
`;

export default MyApp;
