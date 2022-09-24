import React, { useEffect, useContext } from "react"
import DispatchContext from "../DispatchContext"
import { useImmer } from "use-immer"
import axios from "axios"
import { Link } from "react-router-dom"

function Search() {
  const appDispatch = useContext(DispatchContext)

  const [state, setState] = useImmer({
    searchTerm: "",
    results: [],
    show: "neither", // can be loading icon or show the results
    requestCount: 0
  })

  useEffect(() => {
    document.addEventListener("keyup", searchKeyPressHandler)
    // clean up function. If search is closed we dont want to continue listening
    return () => document.removeEventListener("keyup", searchKeyPressHandler)
  }, [])

  useEffect(() => {
    if (state.searchTerm.trim()) {
      // show the loading before sending the request
      setState(draft => {
        draft.show = "loading"
      })
      const delay = setTimeout(() => {
        setState(draft => {
          draft.requestCount++ // increment request to have axios in a different useEffect
        })
      }, 700)
      //clean up function to cancel time out (DEBOUNCE)
      return () => clearTimeout(delay)
    } else {
      // if string is empty
      setState(draft => {
        draft.show = "neither"
      })
    }
  }, [state.searchTerm])

  // NOTE: to search, our database should have title and body indexed
  useEffect(() => {
    // needs to be > 0. Will not run when component first renders
    if (state.requestCount) {
      // cancel token
      const ourRequest = axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await axios.post("/search", { searchTerm: state.searchTerm }, { cancelToken: ourRequest.token })
          setState(draft => {
            draft.results = response.data
            draft.show = "results"
          })
        } catch (e) {
          console.log(e)
        }
      }
      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [state.requestCount])

  function searchKeyPressHandler(e) {
    if (e.keyCode == 27) {
      // 27 ESC key
      appDispatch({ type: "closeSearch" })
    }
  }

  function handleInput(e) {
    const value = e.target.value
    setState(draft => {
      // usually we dont mutate state but with immer we can using this draft
      draft.searchTerm = value
    })
  }

  return (
    <div className="search-overlay">
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input onChange={handleInput} autoFocus type="text" autoComplete="off" id="live-search-field" className="live-search-field" placeholder="What are you interested in?" />
          <span onClick={() => appDispatch({ type: "closeSearch" })} className="close-live-search">
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div className={"circle-loader " + (state.show == "loading" ? "circle-loader--visible" : "")}></div>
          <div className={"live-search-results " + (state.show == "results" ? "live-search-results--visible" : "")}>
            {Boolean(state.results.length) && (
              <div className="list-group shadow-sm">
                <div className="list-group-item active">
                  <strong>Search Results</strong> ({state.results.length} {state.results.length > 1 ? "items" : "item"} found)
                </div>
                {state.results.map(post => {
                  const date = new Date(post.createdDate)
                  const dateFormatted = `${date.getMonth() + 1} / ${date.getDay()} / ${date.getFullYear()}`

                  return (
                    <Link
                      onClick={() =>
                        appDispatch({
                          type: "closeSearch"
                        })
                      }
                      key={post._id}
                      to={`/post/${post._id}`}
                      className="list-group-item list-group-item-action"
                    >
                      <img className="avatar-tiny" src={post.author.avatar} /> <strong>{post.title}</strong>{" "}
                      <span className="text-muted small">
                        by {post.author.username} on {dateFormatted}{" "}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
            {!Boolean(state.results.length) && <p className="alert alert-danger text-center shadow-sm">Sorry, no results found for that search.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Search
