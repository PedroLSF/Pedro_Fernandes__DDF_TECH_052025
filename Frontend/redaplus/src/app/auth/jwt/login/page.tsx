import { JwtLoginView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Redaplus: Entrar',
};

export default function LoginPage() {
  return <JwtLoginView />;
}
