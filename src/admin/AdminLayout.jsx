// In your AdminLayout.jsx or route configuration
import AdminBar from './AdminBar';

export default function AdminLayout(props) {
  return (
    <>
        <AdminBar/>
        {props.children}
    </>
  )
}