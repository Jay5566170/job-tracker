import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

import {
  FaArrowLeft,
  FaBriefcase,
  FaBuilding,
  FaLink,
  FaClipboardCheck,
  FaSave,
  FaTrash,
  FaCalendarAlt
} from "react-icons/fa";


function JobDetails(){

const {id}=useParams();
const navigate=useNavigate();

const [job,setJob]=useState(null);
const [application,setApplication]=useState(null);

const [status,setStatus]=useState("saved");
const [notes,setNotes]=useState("");

const [loading,setLoading]=useState(true);
const [saving,setSaving]=useState(false);



useEffect(()=>{

loadJob();
loadApplication();

},[id]);





const loadJob=async()=>{

try{

const response=await api.get(`/jobs/${id}`);

setJob(response.data);


}catch(error){

console.error(error);
navigate("/jobs");

}

finally{

setLoading(false);

}

};






const loadApplication=async()=>{

try{

const response=await api.get("/applications/");


const current=response.data.find(

item=>item.job_id===Number(id)

);



if(current){

setApplication(current);
setStatus(current.status);
setNotes(current.notes || "");

}


}catch(error){

console.error(error);

}

};








const saveApplication=async()=>{


try{

setSaving(true);


if(application){


await api.put(

`/applications/${application.id}`,

{
status,
notes
}

);


}else{


await api.post(

"/applications/",

{
job_id:Number(id),
status,
notes
}

);


}


alert("Application saved");

loadApplication();



}catch(error){

console.error(error);

alert("Save failed");


}

finally{

setSaving(false);

}


};







const deleteJob=async()=>{


if(!window.confirm("Delete this job?"))

return;


try{


await api.delete(`/jobs/${id}`);

navigate("/jobs");


}catch(error){

alert("Delete failed");

}


};







if(loading)

return (

<div style={styles.loading}>
Loading...
</div>

);



if(!job)

return null;







return(


<div style={styles.container}>


<div style={styles.card}>



<div style={styles.header}>


<button

onClick={()=>navigate("/jobs")}

style={styles.backButton}

>

<FaArrowLeft/>

Back

</button>


</div>







<div style={styles.jobHeader}>


<h1 style={styles.title}>

<FaBriefcase/>

{job.role}

</h1>




<p style={styles.company}>

<FaBuilding/>

{job.company}

</p>




{

job.url &&

<p style={styles.url}>

<FaLink/>

<a

href={job.url}

target="_blank"

rel="noreferrer"

>

View Job Posting

</a>

</p>

}


</div>







<div style={styles.section}>


<h3>Description</h3>


<p style={styles.description}>

{job.description || "No description available"}

</p>


</div>








{

application &&


<div style={styles.statusCard}>


<h3>
Current Status
</h3>



<span style={styles.badge}>

{application.status}

</span>




<p style={styles.date}>

<FaCalendarAlt/>

Applied:

{" "}

{

application.applied_date

?

new Date(application.applied_date)
.toLocaleDateString()

:

"N/A"

}

</p>



</div>


}









<div style={styles.trackCard}>


<h2 style={styles.trackTitle}>

<FaClipboardCheck/>

Application Tracking

</h2>





<label style={styles.label}>

Status

</label>



<select

value={status}

onChange={(e)=>setStatus(e.target.value)}

style={styles.select}

>


<option value="saved">
Saved
</option>

<option value="applied">
Applied
</option>

<option value="interview">
Interview
</option>

<option value="technical">
Technical Interview
</option>

<option value="offer">
Offer
</option>

<option value="rejected">
Rejected
</option>


</select>







<textarea

value={notes}

onChange={(e)=>setNotes(e.target.value)}

placeholder="Add notes..."

style={styles.textarea}

/>







<div style={styles.actions}>


<button

onClick={saveApplication}

style={styles.save}

>


<FaSave/>

{saving ? "Saving..." : "Save Application"}


</button>





<button

onClick={deleteJob}

style={styles.delete}

>

<FaTrash/>

Delete Job


</button>



</div>




</div>






</div>


</div>


);


}









const styles={



container:{

padding:"30px",

maxWidth:"900px",

margin:"0 auto"

},



card:{

background:"white",

padding:"30px",

borderRadius:"16px",

boxShadow:"0 4px 15px rgba(0,0,0,.08)"

},



header:{

marginBottom:"20px"

},



backButton:{

display:"flex",

alignItems:"center",

gap:"8px",

background:"#64748b",

color:"white",

border:"none",

padding:"9px 18px",

borderRadius:"8px",

cursor:"pointer"

},



jobHeader:{

borderBottom:"1px solid #e5e7eb",

paddingBottom:"20px"

},



title:{

display:"flex",

alignItems:"center",

gap:"12px",

fontSize:"30px",

color:"#1a1a2e",

marginBottom:"10px"

},



company:{

display:"flex",

alignItems:"center",

gap:"8px",

color:"#64748b",

fontSize:"17px"

},



url:{

display:"flex",

alignItems:"center",

gap:"8px",

marginTop:"12px"

},



section:{

marginTop:"25px"

},



description:{

color:"#475569",

lineHeight:"1.7"

},



statusCard:{

marginTop:"25px",

background:"#f8fafc",

padding:"20px",

borderRadius:"12px"

},



badge:{

display:"inline-block",

marginTop:"8px",

background:"#22c55e",

color:"white",

padding:"7px 16px",

borderRadius:"20px"

},



date:{

display:"flex",

alignItems:"center",

gap:"8px",

marginTop:"15px",

color:"#64748b"

},



trackCard:{

marginTop:"25px",

background:"#f8fafc",

padding:"25px",

borderRadius:"12px"

},



trackTitle:{

display:"flex",

alignItems:"center",

gap:"10px",

fontSize:"21px"

},



label:{

fontWeight:"600"

},



select:{

width:"100%",

padding:"12px",

marginTop:"10px",

borderRadius:"8px",

border:"1px solid #cbd5e1"

},



textarea:{

width:"100%",

height:"110px",

marginTop:"15px",

padding:"12px",

borderRadius:"8px",

border:"1px solid #cbd5e1",

boxSizing:"border-box"

},



actions:{

display:"flex",

gap:"12px",

marginTop:"18px"

},



save:{

display:"flex",

alignItems:"center",

gap:"8px",

background:"#38bdf8",

color:"white",

border:"none",

padding:"10px 18px",

borderRadius:"8px",

cursor:"pointer"

},



delete:{

display:"flex",

alignItems:"center",

gap:"8px",

background:"#ef4444",

color:"white",

border:"none",

padding:"10px 18px",

borderRadius:"8px",

cursor:"pointer"

},



loading:{

padding:"40px",

textAlign:"center"

}


};



export default JobDetails;