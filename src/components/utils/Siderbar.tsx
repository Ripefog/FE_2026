import {
  Drawer,
  IconButton,
  List,
  ListItemIcon,
  ListItemText,
  Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ListItemButton from '@mui/material/ListItemButton';
import { SidebarProps } from '@/types/Utils';
import { useTheme } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

import { useRouter } from 'next/navigation';

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const router = useRouter();
  const toggleDrawer = (state: boolean) => () => {
    setOpen(state);
  };

  const handleLogOut = () => {
    localStorage.removeItem("username");
    router.push('/login');
  };

  const theme = useTheme();

  return (
    <div>
      {/* Menu button */}
      {!open && (
        <IconButton
          onClick={toggleDrawer(true)}
          sx={{
            position: 'fixed',
            top: 1,
            left: 1,
            zIndex: 1300,
            backgroundColor: '#009688',
            boxShadow: 1,
            p: '2px',
            minWidth: 'unset',
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: '#00796b',
            },
          }}
        >
          <MenuIcon sx={{ fontSize: 18 }} />
        </IconButton>
      )}

      {/* Drawer sidebar */}
      <Drawer
        anchor="left"
        open={open}
        onClose={toggleDrawer(false)}
        variant={'temporary'}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: '#F7E7CE',
            },
          },
        }}
      >
        {/* Nút đóng */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={toggleDrawer(false)}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>

        <List className="flex flex-col justify-between h-screen">
          <Box>
            {/* Simple search → router.push */}
            <ListItemButton
              onClick={() => router.push('/simple')}
              sx={{ gap: 0.5, minHeight: 40 }}
            >
              <ListItemIcon sx={{ minWidth: 30 }}>
                <SearchIcon />
              </ListItemIcon>
              <ListItemText
                primary="Simple search"
                slotProps={{
                  primary: {
                    sx: {
                      fontFamily: 'monospace',
                      fontWeight: 600,
                    },
                  },
                }}
              />
            </ListItemButton>

            {/* Submit → mở tab mới */}
            <ListItemButton
              component="a"
              href="/submit"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ gap: 0.5, minHeight: 40 }}
            >
              <ListItemIcon sx={{ minWidth: 30 }}>
                <UploadFileIcon />
              </ListItemIcon>
              <ListItemText
                primary="Submit"
                slotProps={{
                  primary: {
                    sx: {
                      fontFamily: 'monospace',
                      fontWeight: 600,
                    },
                  },
                }}
              />
            </ListItemButton>

            {/* Check video → mở tab mới */}
            <ListItemButton
              component="a"
              href="/check-video"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ gap: 0.5, minHeight: 40 }}
            >
              <ListItemIcon sx={{ minWidth: 30 }}>
                <VideoLibraryIcon />
              </ListItemIcon>
              <ListItemText
                primary="Check video"
                slotProps={{
                  primary: {
                    sx: {
                      fontFamily: 'monospace',
                      fontWeight: 600,
                    },
                  },
                }}
              />
            </ListItemButton>

            {/* Results */}
            <ListItemButton
              component="a"
              href="/results"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ gap: 0.5, minHeight: 40 }}
            >
              <ListItemIcon sx={{ minWidth: 30 }}>
                <AssessmentIcon />
              </ListItemIcon>
              <ListItemText
                primary="Results"
                slotProps={{
                  primary: {
                    sx: {
                      fontFamily: 'monospace',
                      fontWeight: 600,
                    },
                  },
                }}
              />
            </ListItemButton>

            <ListItemButton
              component="a"
              href="/question"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ gap: 0.5, minHeight: 40 }}
            >
              <ListItemIcon sx={{ minWidth: 30 }}>
                <HelpOutlineIcon />
              </ListItemIcon>
              <ListItemText
                primary="Question"
                slotProps={{
                  primary: {
                    sx: {
                      fontFamily: 'monospace',
                      fontWeight: 600,
                    },
                  },
                }}
              />
            </ListItemButton>
          </Box>

          {/* Đăng xuất */}
          <Box className="mb-[50px]">
            <ListItemButton
            onClick={handleLogOut}
            sx={{ gap: 0.5, minHeight: 40}}
          >
            <ListItemIcon sx={{ minWidth: 30 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Đăng xuất"
              slotProps={{
                primary: {
                  sx: {
                    fontFamily: 'monospace',
                    fontWeight: 600,
                  },
                },
              }}
            />
          </ListItemButton>
          </Box>
        </List>
      </Drawer>
    </div>
  );
}
