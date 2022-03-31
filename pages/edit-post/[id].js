import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import ReactMarkdown from "react-markdown";
import { css } from "@emotion/css";
import dynamic from "next/dynamic";
import { create } from "ipfs-http-client";
import { KontourContext } from "../../context";

const ipfsURI = "https://ipfs.io/ipfs/";
const client = create("https://ipfs.infura.io:5001/api/v0");

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

export default function Post() {
  const kontour = useContext(KontourContext);
  const [post, setPost] = useState(null);
  const [editing, setEditing] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    fetchPost();
  }, [kontour, id]);

  async function fetchPost() {
    if (!kontour) {
      return;
    }
    const val = await kontour.contracts.Blog.view.fetchPost(id);
    const postId = Number(val[0]);
    try {
      const response = await fetch(`${ipfsURI}/${val[2]}`);
      const data = await response.json();
      if (data.coverImage) {
        let coverImage = `${ipfsURI}/${data.coverImage}`;
        data.coverImage = coverImage;
      }
      /* finally we append the post ID to the post data */
      /* we need this ID to make updates to the post */
      data.id = postId;
      setPost(data);
    } catch (e) {
      setPost({
        title: val[1],
        id: postId,
      });
    }
  }

  async function savePostToIpfs() {
    try {
      const added = await client.add(JSON.stringify(post));
      return added.path;
    } catch (err) {
      console.log("error: ", err);
    }
  }

  async function updatePost() {
    const hash = await savePostToIpfs();
    await kontour.contracts.Blog.nonpayable.updatePost(
      post.id,
      post.title,
      hash,
      true
    );

    router.push("/");
  }

  if (!post) return null;

  return (
    <div className={container}>
      {/* editing state will allow the user to toggle between */
      /*  a markdown editor and a markdown renderer */}
      {editing && (
        <div>
          <input
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            name="title"
            placeholder="Give it a title ..."
            value={post.title}
            className={titleStyle}
          />
          <SimpleMDE
            className={mdEditor}
            placeholder="What's on your mind?"
            value={post.content}
            onChange={(value) => setPost({ ...post, content: value })}
          />
          <button className={button} onClick={updatePost}>
            Update post
          </button>
        </div>
      )}
      {!editing && (
        <div>
          {post.coverImagePath && (
            <img src={post.coverImagePath} className={coverImageStyle} />
          )}
          <h1>{post.title}</h1>
          <div className={contentContainer}>
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </div>
      )}
      <button
        className={button}
        onClick={() => setEditing(editing ? false : true)}
      >
        {editing ? "View post" : "Edit post"}
      </button>
    </div>
  );
}

const button = css`
  background-color: #fafafa;
  outline: none;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  margin-right: 10px;
  margin-top: 15px;
  font-size: 18px;
  padding: 16px 70px;
  box-shadow: 7px 7px rgba(0, 0, 0, 0.1);
`;

const titleStyle = css`
  margin-top: 40px;
  border: none;
  outline: none;
  background-color: inherit;
  font-size: 44px;
  font-weight: 600;
  &::placeholder {
    color: #999999;
  }
`;

const mdEditor = css`
  margin-top: 40px;
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
