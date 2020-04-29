import React, { useState, useRef } from "react"
import ReactDOM from "react-dom"

function App() {
  const [url, setUrl] = useState("251e42f")

  const [page, setPage] = useState("")
  const [links, setLinks] = useState([])
  const [error, setError] = useState(false)
  const pageRef = useRef(null)

  async function _handleSubmit(e) {
    e.preventDefault()

    await setError(false)
    const page = await fetch(
      `https://cors-e.herokuapp.com/https://content.govdelivery.com/accounts/USCENSUS/bulletins/${url}`
    ).then(res => res.text())
    await setPage(page)

    //scrape page for urls
    const main = pageRef.current.querySelector(".main-table")
    if (main) {
      const aTags = main.querySelectorAll("a")
      const links = Array.from(aTags).map(link => {
        let content = link.text
        let type = "text"

        if (!content) {
          const image = link.querySelector("img")
          if (image) {
            type = "image"
            content = (
              <img
                src={image.src}
                alt={image.alt}
                style={{ maxHeight: "5em", backgroundColor: "black" }}
              />
            )
          } else {
            console.log(link)
            type = "hidden link"
          }
        }
        return { href: link.href, content, type }
      })
      setLinks(links)
    } else {
      setLinks([])
      setError(true)
    }
  }

  function testLinks() {
    //open all links in new tab
    ;[...new Set(links.map(link => link.href))].forEach(url =>
      window.open(url, "_blank")
    )
  }

  return (
    <div className='App'>
      <h2>GovDelivery Link Tester</h2>
      <p>
        Input a https://content.govdelivery.com/accounts/USCENSUS/bulletins/ ID,
        then click Submit.
      </p>
      <form onSubmit={e => _handleSubmit(e)}>
        <input
          type='text'
          style={{ textAlign: "center", width: "30em" }}
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
        <br />
        <input type='submit' value='Submit' />
      </form>
      {error ? <h3>link is not vaild</h3> : null}
      {links.length ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h3>{links.length} Links found</h3>
          <button style={{ width: "50%" }} onClick={testLinks}>
            Test all links (make sure to allow all popups)
          </button>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Content</th>
              </tr>
            </thead>
            <tbody>
              {links.map(link => (
                <tr>
                  <td>{link.type}</td>
                  <td>
                    <a
                      target='_blank'
                      href={link.href}
                      rel='noopener noreferrer'
                    >
                      {link.content ? link.content : "hidden link"}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <hr />
      {page ? (
        <div>
          <h3>Page</h3>
          <div
            ref={pageRef}
            style={{ margin: "2em" }}
            dangerouslySetInnerHTML={{ __html: page }}
          />
        </div>
      ) : null}
    </div>
  )
}

const rootElement = document.getElementById("root")
ReactDOM.render(<App />, rootElement)
