import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { CallsBadge } from './CallsBadge';
import { Auth } from 'aws-amplify';
import { AuthState } from '@aws-amplify/ui-components';
import './header.css';
import { AppAuthStateProps } from '../../types/propTypes';

export const Header = (props: AppAuthStateProps) => {

    return props.authState === AuthState.SignedIn && props.userName !== '' ? (
        <Navbar collapseOnSelect fixed="top" expand='lg'>

            <NavLink className='nav-link' activeClassName='activeRoute' to='/dashboard'>
                <img src='/logo.png' height={48} />
            </NavLink>

            <Navbar.Toggle aria-controls='responsive-navbar-nav' />

            <Navbar.Collapse id='responsive-navbar-nav'>
                <Nav className="ml-auto" variant='pills' defaultActiveKey='/dashboard' as='ul'>
                </Nav>
                <NavDropdown title={props.userName} id="user-dropdown">
                    <NavDropdown.Item href="/settings">
                        Settings
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={() => Auth.signOut()}>
                        Log Out
                    </NavDropdown.Item>
                </NavDropdown>
            </Navbar.Collapse>
        </Navbar>
    ) : (
        <Navbar collapseOnSelect fixed="top" expand='lg'>
            <Navbar.Brand>
                <img src='/logo.png' height={48} />
            </Navbar.Brand>
        </Navbar>
    )
}