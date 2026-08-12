import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import doctorModel from './models/doctorModel.js';
import 'dotenv/config';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("Doctor@123", salt);
        
        let doc = await doctorModel.findOne({ email: "testdoctor@appointy.com" });
        if(doc) {
            doc.password = hashedPassword;
            await doc.save();
            console.log("Updated test doctor password");
        } else {
            doc = new doctorModel({
                name: "Dr. Test User",
                email: "testdoctor@appointy.com",
                password: hashedPassword,
                image: "https://plus.unsplash.com/premium_photo-1661764878654-3d0fc2eefcca?q=80&w=200&auto=format&fit=crop",
                speciality: "General physician",
                degree: "MBBS",
                experience: "5 Years",
                about: "Great doctor",
                fees: 500,
                address: { line1: "Test Clinic", line2: "New Delhi" },
                date: Date.now(),
                available: true
            });
            await doc.save();
            console.log("Created test doctor");
        }
    } catch(err) {
        console.error(err);
    }
    process.exit(0);
});
