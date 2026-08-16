import { 
    Box,
    TextField,
    Typography,
    Button
} from "@mui/material";
import { LoginProps } from "@/types/Utils";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login({
  closeModal,
}: LoginProps) {
    const router = useRouter(); 
    const [username, setUsername] = useState("");
    const handleUsernameChange = (value: string) => {
        setUsername(value);
    };
    const [message, setMessage] = useState("")
    const [error, setError] = useState(false)
    const handleLogin = async () => {
        const allowedUsers = ["Duy Khương", "Văn Huấn", "Minh Trí", "Ngọc Minh", "Văn Nam"];

        if (!allowedUsers.includes(username)) {
            setError(true)
            setMessage("Sai tên đăng nhập")
            return;
        }

        localStorage.setItem("username", username);
        router.push('/simple')
    };

    return (
        <Box className="fixed top-0 left-0 w-screen h-screen bg-[rgba(0,0,0,0.6)] flex justify-center items-center z-[9999]" onClick={closeModal}>
            <Box className="w-[250px] h-[200px] bg-white p-2 rounded-10 flex flex-col justify-around items-center" onClick={(e) => {e.stopPropagation()}}>
                <Typography sx={{ fontFamily: "monospace" }}>Login</Typography>
                <TextField
                    id="filled-basic"
                    label="Username"
                    variant="filled"
                    value={username}
                    onChange={(e) => {
                        handleUsernameChange(e.target.value);
                        if (error) { // reset lỗi khi người dùng gõ lại
                        setError(false);
                        setMessage("");
                        }
                    }}
                    size="small"
                    fullWidth 
                    slotProps={{
                        input: {
                        className: "font-mono"
                        }
                    }}
                    error={error} // <-- làm viền TextField đỏ
                    helperText={error ? message : ""} // <-- hiển thị thông báo lỗi
                />
                <Button variant="contained" onClick={handleLogin}>
                    Đăng nhập
                </Button>
            </Box>
        </Box>
    )
}