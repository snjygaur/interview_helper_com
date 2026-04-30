import { Link } from "react-router-dom"

export default function Landing() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      background: "#161616",
      color: "white",
      padding: "20px"
    }}>
      <h1 style={{fontSize:"3rem"}}>
        AI Interview <span style={{color:"#d20d3b"}}>Prep Platform</span>
      </h1>

      <p style={{maxWidth:"600px", marginTop:"10px"}}>
        Generate personalized interview strategies, technical questions,
        and preparation plans using AI based on your resume & job description.
      </p>

      <div style={{marginTop:"30px"}}>
        <Link to="/login">
          <button className="button primary-button">Try Now</button>
        </Link>
      </div>
    </div>
  )
}