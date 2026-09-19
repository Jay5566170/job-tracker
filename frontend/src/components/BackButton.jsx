import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";


function BackButton(){

const navigate = useNavigate();


return(

<button

onClick={()=>navigate(-1)}

style={styles.button}

>

<FaArrowLeft/>

Back

</button>


)

}



const styles={

button:{

display:"inline-flex",

alignItems:"center",

gap:"8px",

background:"#64748b",

color:"white",

border:"none",

padding:"8px 16px",

borderRadius:"6px",

cursor:"pointer",

fontSize:"14px",

marginBottom:"15px"

}

}



export default BackButton;