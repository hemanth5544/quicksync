import { useState } from "react"

function IndexPopup() {
  const [data, setData] = useState("")

  return (
    <div
      style={{
        padding: 16,
        minWidth: 300
      }}>
      <h2>
        Welcome to{" "}
        <a href="https://clip.fish" target="_blank">
          Quick Sync
        </a>
      </h2>
      <p>Share anything between your devices in seconds</p>
      <input 
        onChange={(e) => setData(e.target.value)} 
        value={data}
        placeholder="Enter text..."
        style={{
          width: "100%",
          padding: 8,
          marginTop: 8
        }}
      />
    </div>
  )
}

export default IndexPopup
