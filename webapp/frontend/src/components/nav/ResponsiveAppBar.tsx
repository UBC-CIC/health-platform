import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { AppAuthStateProps } from '../../types/propTypes';
import { Link } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import { Divider, ListItemIcon } from '@mui/material';
import { Key, LockReset, Logout, Person } from '@mui/icons-material';
import ChangePassword from './ChangePassword';

const pages = ['Dashboard', 'Events', 'Patients'];

const ResponsiveAppBar = (props: AppAuthStateProps) => {
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const [openChangePassword, setOpenChangePassword] = React.useState(false);

    const handleOpenNavMenu = (event: any) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: any) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        console.log("handle close");
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
                        >
                            <img src='/logo.png' height={48} />
                        </Typography>

                        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleOpenNavMenu}
                                color="inherit"
                            >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorElNav}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                open={Boolean(anchorElNav)}
                                onClose={handleCloseNavMenu}
                                sx={{
                                    display: { xs: 'block', md: 'none' },
                                }}
                            >
                                {pages.map((page) => (
                                    <MenuItem key={`collapse-${page}`} onClick={handleCloseNavMenu} component={Link} to={`/${page.toLowerCase()}`}>
                                        <Typography textAlign="center">{page}</Typography>
                                    </MenuItem>
                                ))}

                                {(props.userDetail.user_type === "ADMIN") && 
                                    <MenuItem key={`collapse-Users`} onClick={handleCloseNavMenu} component={Link} to={`/users`}>
                                        <Typography textAlign="center">Users</Typography>
                                    </MenuItem>
                                }

                                {(props.userDetail.user_type === "ADMIN") && 
                                    <MenuItem key={`collapse-Simulate`} onClick={handleCloseNavMenu} component={Link} to={`/simulate`}>
                                        <Typography textAlign="center">Simulate</Typography>
                                    </MenuItem>
                                }
                            </Menu>
                        </Box>
            
                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
                        >
                            Health Integrated
                        </Typography>
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            {pages.map((page) => (
                                <Link key={page} to={`/${page.toLowerCase()}`} style={{textDecoration: "none"}}>
                                    <Button
                                        key={page}
                                        onClick={handleCloseNavMenu}
                                        sx={{ my: 2, color: 'white', display: 'block' }}
                                    >
                                        {page}
                                    </Button>
                                </Link>
                            ))}

                            {(props.userDetail.user_type === "ADMIN") && 
                                <Link key="Users" to={`/users`} style={{textDecoration: "none"}}>
                                    <Button
                                        key="Users"
                                        onClick={handleCloseNavMenu}
                                        sx={{ my: 2, color: 'white', display: 'block' }}
                                    >
                                        Users
                                    </Button>
                                </Link>
                            }

                            {(props.userDetail.user_type === "ADMIN") && 
                                <Link key="Simulate" to={`/simulate`} style={{textDecoration: "none"}}>
                                    <Button
                                        key="Simulate"
                                        onClick={handleCloseNavMenu}
                                        sx={{ my: 2, color: 'white', display: 'block' }}
                                    >
                                        Simulate
                                    </Button>
                                </Link>
                            }
                        </Box>

                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="Open settings">
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                    <Avatar alt={props.userName} src="/static/images/avatar/2.jpg" />
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                <MenuItem>
                                    <ListItemIcon>
                                        <Person fontSize="small" />
                                    </ListItemIcon>
                                    {props.userName}
                                </MenuItem>
                                <Divider sx={{ my: 0.5 }} />
                                <MenuItem onClick={() => setOpenChangePassword(true)}>
                                    <ListItemIcon>
                                        <Key fontSize="small" />
                                    </ListItemIcon>
                                    Change Password
                                </MenuItem>
                                <MenuItem onClick={() => Auth.signOut()}>
                                    <ListItemIcon>
                                        <Logout fontSize="small" />
                                    </ListItemIcon>
                                    Logout
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar >
            <ChangePassword open={openChangePassword} setOpen={setOpenChangePassword} />
        </>
    );
};
export default ResponsiveAppBar;
