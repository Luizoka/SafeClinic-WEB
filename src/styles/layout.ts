import styled from 'styled-components';

export const Layout = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const Header = styled.header`
  background: var(--white);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
`;

export const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
`;

export const Nav = styled.nav`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

export const Main = styled.main`
  flex: 1;
  padding: 2rem 0;
`;

export const Sidebar = styled.aside`
  width: 250px;
  background: var(--white);
  padding: 2rem;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
`;

export const SidebarItem = styled.div`
  padding: 0.75rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-light);

  &:hover {
    background: var(--background);
    color: var(--primary);
  }

  &.active {
    background: var(--primary);
    color: var(--white);
  }
`;

export const DashboardLayout = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
`;

export const DashboardContent = styled.div`
  padding: 2rem;
`;

export const Footer = styled.footer`
  background: var(--white);
  padding: 2rem 0;
  margin-top: auto;
  border-top: 1px solid #E2E8F0;
`;

export const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
  color: var(--text-light);
`; 