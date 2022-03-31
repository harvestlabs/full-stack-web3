import ReactMarkdown from "react-markdown";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { css } from "@emotion/css";
import { AccountContext, KontourContext } from "../../context";

const ipfsURI = "https://ipfs.io/ipfs/";

export default function Post() {
  const kontour = useContext(KontourContext);
  const { account, owner } = useContext(AccountContext);
  const [post, setPost] = useState(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    async function setup() {
      if (!kontour) {
        return;
      }
      const post = await kontour.contracts.Blog.view.fetchPost(id);
      try {
        const response = await fetch(`${ipfsURI}/${post[2]}`);
        const data = await response.json();
        if (data.coverImage) {
          let coverImage = `${ipfsURI}/${data.coverImage}`;
          data.coverImage = coverImage;
        }
        setPost(data);
      } catch (e) {
        setPost({
          title: post[1],
        });
      }
    }
    setup();
  }, [kontour, id]);

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {post && (
        <div className={container}>
          {
            /* if the owner is the user, render an edit button */
            owner === account && (
              <div className={editPost}>
                <Link href={`/edit-post/${id}`}>
                  <a>Edit post</a>
                </Link>
              </div>
            )
          }
          {
            /* if the post has a cover image, render it */
            post.coverImage && (
              <img src={post.coverImage} className={coverImageStyle} />
            )
          }
          <h1>{post.title}</h1>
          <div className={contentContainer}>
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

const editPost = css`
  margin: 20px 0px;
`;

const coverImageStyle = css`
  width: 900px;
`;

const container = css`
  width: 900px;
  margin: 0 auto;
`;

const contentContainer = css`
  margin-top: 60px;
  padding: 0px 40px;
  border-left: 1px solid #e7e7e7;
  border-right: 1px solid #e7e7e7;
  & img {
    max-width: 900px;
  }
`;
