import nodemailer from 'nodemailer'
        
export const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', 
    port: 587, 
    secure: false,
    auth: {
        user: 'leedons9585@gmail.com',
        pass: 'cscm ohpy ajib pjam' 
    }
});
