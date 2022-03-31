import { css } from "@emotion/css";
import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { KontourContext, AccountContext } from "../context";

export default function Home() {
  const kontour = useContext(KontourContext);
  const { account, owner } = useContext(AccountContext);
  const [posts, setPosts] = useState([]);
  const [kontourURL, setKontourURL] = useState("");

  useEffect(() => {
    async function setup() {
      if (!kontour) {
        return;
      }
      if (kontour?.contracts?.Blog) {
        const data = await kontour.contracts.Blog.view.fetchPosts();
        setPosts(JSON.parse(JSON.stringify(data)));
      } else {
        // otherwise reset if there was an error
        localStorage.setItem("kontour-sdk", "");
        alert(
          "There was an error reading the SDK! Are you sure you deployed the Blog contract?"
        );
        window.location.assign("/");
      }
    }
    setup();
  }, [kontour]);

  const router = useRouter();
  async function navigate() {
    router.push("/create-post");
  }

  return (
    <div>
      {kontour == null && (
        <div className={kontourOverlay}>
          <div className={kontourModal}>
            <h1>Welcome to the Kontour Client demo!</h1>
            <p>
              This demo is a fork of nader dabit (@dabit3)&apos;s{" "}
              <a href="https://dev.to/edge-and-node/the-complete-guide-to-full-stack-web3-development-4g74">
                guide to full stack web3 development
              </a>{" "}
              , deployed with <a href="https://kontour.io">Kontour</a>
            </p>
            <p>
              To get started, please paste the Javascript SDK you copied from
              your demo project in the input below.
            </p>
            <p>
              Using the SDK, we&apos;ll connect this client directly to your
              running test node by injecting it as a script tag. Remember: you
              can easily do the same with your own codebase!
            </p>
            <div className={kontourForm}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log(kontourURL);
                  const url = new URL(kontourURL);
                  const vals = url.pathname.split("/");
                  const sdk = vals[vals.length - 1];
                  console.log("link", sdk);
                  window.location.assign(`?sdk=${sdk}`);
                }}
              >
                <input
                  className="kontour-input"
                  type="url"
                  value={kontourURL}
                  placeholder={
                    "e.g, https://api.kontour.io/sdk/Sandbox-MTY1NjZmODOIJDQOWoojpwKhqokpOQxLTUyNzI2NDA2ZDgyZQ=="
                  }
                  onChange={(e) => {
                    setKontourURL(e.currentTarget.value);
                  }}
                />
                <label>paste SDK url here</label>
                {!kontourURL ? null : isValidKontourUrl(kontourURL) ? (
                  <input
                    className={kontourSubmit}
                    type="submit"
                    value="Insert SDK"
                  />
                ) : (
                  <p className={kontourError}>
                    ERROR: Invalid URL. Make sure you&apos;ve copied the right
                    link!
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      <div className={postList}>
        {
          /* map over the posts array and render a button with the post title */
          posts.map((post, index) => (
            <Link href={`/post/${post[2]}`} key={index}>
              <a>
                <div className={linkStyle}>
                  <p className={postTitle}>{post[1]}</p>
                  <div className={arrowContainer}>
                    <img
                      src="/right-arrow.svg"
                      alt="Right arrow"
                      className={smallArrow}
                    />
                  </div>
                </div>
              </a>
            </Link>
          ))
        }
      </div>
      <div className={container}>
        {account === owner && posts && !posts.length && (
          /* if the signed in user is the account owner, render a button */
          /* to create the first post */
          <button className={buttonStyle} onClick={navigate}>
            Create your first post
            <img src="/right-arrow.svg" alt="Right arrow" className={arrow} />
          </button>
        )}
      </div>
    </div>
  );
}
function isValidKontourUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return (
    (url.protocol === "http:" || url.protocol === "https:") &&
    url.host === "api.kontour.io"
  );
}

const kontourSubmit = css`
  width: 200px;
  height: 40px;
  border-radius: 20px;
  border: 2px solid rgb(210, 210, 210);
  margin-top: 20px;
  background: white;
  cursor: pointer;
  &:active {
    background-color: rgb(230, 230, 230);
    border: 2px solid rgb(190, 190, 190);
  }
`;

const kontourError = css`
  padding-top: 20px;
  color: red;
  font-size: 14px;
`;

const kontourForm = css`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  & form {
    flex-direction: column;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-top: 32px;
    margin-bottom: 24px;
  }
  & label {
    margin-top: 4px;
    font-size: 14px;
  }
  & .kontour-input {
    width: 100%;
    height: 40px;
    text-align: center;
    padding: 12px;
    max-width: 400px;
  }
`;

const kontourModal = css`
  width: 700px;
  height: 500px;
  max-width: 80%;
  max-height: 80%;
  background-color: white;
  border: 2px solid rgb(150, 150, 150);
  border-radius: 12px;
  box-shadow: 0px 0px 20px rgb(100, 100, 100);
  display: flex;
  flex-direction: column;
  padding: 40px;
  & > h1 {
    font-size: 18px;
    text-align: center;
    margin-bottom: 24px;
  }

  & a {
    color: rgb(97, 175, 239);
  }
  & p {
    margin-top: 0;
  }
`;

const kontourOverlay = css`
  top: 0;
  left: 0;
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(
    255,
    255,
    255,
    0.7
  ); // Make sure this color has an opacity of less than 1
  backdrop-filter: blur(6px);
`;

const arrowContainer = css`
  display: flex;
  flex: 1;
  justify-content: flex-end;
  padding-right: 20px;
`;

const postTitle = css`
  font-size: 30px;
  font-weight: bold;
  cursor: pointer;
  margin: 0;
  padding: 20px;
`;

const linkStyle = css`
  border: 1px solid #ddd;
  margin-top: 20px;
  border-radius: 8px;
  display: flex;
`;

const postList = css`
  width: 700px;
  margin: 0 auto;
  padding-top: 50px;
`;

const container = css`
  display: flex;
  justify-content: center;
`;

const buttonStyle = css`
  margin-top: 100px;
  background-color: #fafafa;
  outline: none;
  border: none;
  font-size: 44px;
  padding: 20px 70px;
  border-radius: 15px;
  cursor: pointer;
  box-shadow: 7px 7px rgba(0, 0, 0, 0.1);
`;

const arrow = css`
  width: 35px;
  margin-left: 30px;
`;

const smallArrow = css`
  width: 25px;
`;
