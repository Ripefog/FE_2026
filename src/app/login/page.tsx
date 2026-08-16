"use client";
import { useState, useEffect } from "react";
import { 
    Box, 
    CircularProgress, 
    Typography,
    Button, 
    FormControl,
    RadioGroup, 
    FormControlLabel, 
    Radio
} from "@mui/material";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("");
    const [error, setError] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            // Nếu đã login rồi thì chuyển luôn sang trang /simple
            router.push("/simple");
        }
        setLoading(false);
    }, [router]);

    const handleLogin = () => {
        const allowedUsers = ["Duy Khương", "Văn Huấn", "Minh Trí", "Ngọc Minh", "Văn Nam"];

        if (!allowedUsers.includes(username)) {
            setError(true);
            setMessage("Sai tên đăng nhập");
            return;
        }

        localStorage.setItem("username", username);
        router.push("/simple"); // Điều hướng sau khi login
    };

    if (loading) {
        return (
            <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <Box className="w-[300px] bg-white p-6 rounded-lg shadow-md flex flex-col gap-4">
                <Typography sx={{ fontFamily: "monospace" }} variant="h6" align="center">
                    Login
                </Typography>
                
                <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                        value={username}
                        onChange={(e) => {
                        setUsername(e.target.value);
                        if (error) {
                            setError(false);
                            setMessage("");
                        }
                        }}
                    >
                        {["Duy Khương", "Văn Huấn", "Minh Trí", "Ngọc Minh", "Văn Nam"].map((name) => (
                            <FormControlLabel
                                key={name}
                                value={name}
                                control={<Radio />}
                                label={name}
                            />
                        ))}
                    </RadioGroup>
                    {error && <p style={{ color: "red", fontSize: "0.8rem" }}>{message}</p>}
                </FormControl>

                <Button variant="contained" onClick={handleLogin}>
                    Đăng nhập
                </Button>
            </Box>
        </Box>
    );
}
