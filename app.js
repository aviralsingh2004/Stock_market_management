import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 3000;

const app = express();

// API middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

 



app.get('/form', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// app.get('/signupform', (req, res) => {
//     console.log(req.body); // Log the submitted form data
//     res.sendFile(path.join(__dirname, 'public', 'home.html')); // Redirect to home.html
// });

app.post('/formPost', (req, res) => {
    console.log(req.body); // Log the form data
    
   //alert("succesfully logged in ")
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.post('/signUpPost', (req, res) => {
    const { firstName, lastName, email, password } = req.body; // Destructure form data
    
     
    if (firstName&&email&&password) {
         
        res.sendFile(path.join(__dirname, 'public', 'home.html'));
    }
    else{
          console.error("Missing required fields");
         return res.status(400).send("All field are required");
    }

    console.log("Registration data:", { firstName, lastName, email, password });
    
    // Proceed to the home page after validation
     
});


app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
