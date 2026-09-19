import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBriefcase, FaTrash, FaEye, FaArrowLeft } from "react-icons/fa";
import api from "../services/api";


function Jobs() {

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadJobs();
  }, []);


  const loadJobs = async () => {

    try {

      const response = await api.get("/jobs/");
      setJobs(response.data);

    } catch(error) {

      console.error("Error loading jobs:", error);

    } finally {

      setLoading(false);

    }

  };



  const deleteJob = async(id)=>{

    if(!window.confirm("Delete this job?")) return;


    try{

      await api.delete(`/jobs/${id}`);
      loadJobs();

    }catch(error){

      alert("Delete failed");

    }

  };



  if(loading)
    return <div style={styles.loading}>Loading...</div>;



  return (

    <div style={styles.container}>


      <div style={styles.header}>


        <Link to="/" style={styles.backButton}>
          <FaArrowLeft/>
          Back
        </Link>


        <Link to="/jobs/add" style={styles.addButton}>
          + Add Job
        </Link>


      </div>




      <h1 style={styles.title}>
        <FaBriefcase/>
        My Jobs
      </h1>





      {
        jobs.length === 0 ? (

          <div style={styles.empty}>
            No jobs added yet.
          </div>


        ) : (


          <div style={styles.grid}>


          {
            jobs.map(job=>(


              <div key={job.id} style={styles.card}>


                <h3>
                  {job.role}
                </h3>


                <p style={styles.company}>
                  {job.company}
                </p>



                <p>
                  Status:
                  {" "}
                  <span style={styles.status}>
                    {job.status || "Applied"}
                  </span>
                </p>



                <p style={styles.date}>
                  Added:
                  {" "}
                  {new Date(job.created_at).toLocaleDateString()}
                </p>



                <div style={styles.actions}>


                  <Link
                    to={`/jobs/${job.id}`}
                    style={styles.viewButton}
                  >

                    <FaEye/>
                    View Details

                  </Link>



                  <button
                    onClick={()=>deleteJob(job.id)}
                    style={styles.deleteButton}
                  >

                    <FaTrash/>
                    Delete

                  </button>


                </div>


              </div>


            ))
          }


          </div>


        )
      }



    </div>

  );

}




const styles = {


container:{
  padding:"30px",
  maxWidth:"1200px",
  margin:"0 auto"
},


header:{
  display:"flex",
  justifyContent:"space-between",
  marginBottom:"20px"
},


title:{
  display:"flex",
  alignItems:"center",
  gap:"10px",
  color:"#1a1a2e",
  marginBottom:"30px"
},


backButton:{
  display:"flex",
  alignItems:"center",
  gap:"6px",
  background:"#64748b",
  color:"white",
  padding:"8px 14px",
  borderRadius:"6px",
  textDecoration:"none"
},


addButton:{
  background:"#4fc3f7",
  color:"white",
  padding:"10px 18px",
  borderRadius:"6px",
  textDecoration:"none"
},


grid:{
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",
  gap:"20px"
},


card:{
  background:"white",
  padding:"25px",
  borderRadius:"10px",
  boxShadow:"0 2px 8px rgba(0,0,0,0.08)"
},


company:{
  color:"#666"
},


date:{
  color:"#999",
  fontSize:"13px"
},


status:{
  background:"#fff3cd",
  color:"#856404",
  padding:"4px 10px",
  borderRadius:"15px",
  fontSize:"13px"
},


actions:{
  display:"flex",
  gap:"10px",
  marginTop:"20px"
},


viewButton:{
  display:"flex",
  alignItems:"center",
  gap:"6px",
  background:"#4fc3f7",
  color:"white",
  padding:"8px 14px",
  borderRadius:"5px",
  textDecoration:"none"
},


deleteButton:{
  display:"flex",
  alignItems:"center",
  gap:"6px",
  background:"#ef5350",
  color:"white",
  border:"none",
  padding:"8px 14px",
  borderRadius:"5px",
  cursor:"pointer"
},


loading:{
 padding:"40px",
 textAlign:"center"
},


empty:{
 background:"white",
 padding:"40px",
 borderRadius:"10px",
 textAlign:"center"
}


};


export default Jobs;