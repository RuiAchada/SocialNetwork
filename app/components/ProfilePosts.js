import React, { useEffect, useState } from "react"
import axios from "axios"
import { useParams, Link } from "react-router-dom"
import LoadingDotsIcon from "./LoadingDotsIcon"

function ProfilePosts() {
  const { username } = useParams()
  const [isLoading, setIsLoading] = useState(true) // check if axios request is still loading
  const [posts, setPosts] = useState([])

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await axios.get(`/profile/${username}/posts`)
        console.log(response.data)
        setPosts(response.data)
        setIsLoading(false)
      } catch (e) {
        console.log(e)
      }
    }
    fetchPosts() // we set and call the function like this because in useEffect we can't pass an async function directly
  }, [])

  if (isLoading) return <LoadingDotsIcon />

  return (
    <>
      <div className="list-group">
        {posts.map(post => {
          const date = new Date(post.createdDate)
          const dateFormatted = `${date.getMonth() + 1} / ${date.getDay()} / ${date.getFullYear()}`

          return (
            <Link key={post._id} to={`/post/${post._id}`} className="list-group-item list-group-item-action">
              <img className="avatar-tiny" src={post.author.avatar} /> <strong>{post.title}</strong> <span className="text-muted small">on {dateFormatted} </span>
            </Link>
          )
        })}
      </div>
    </>
  )
}

export default ProfilePosts
