import { JwtLoginView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Unyplay: Entrar',
};

export default function LoginPage() {
  return <JwtLoginView />;
}
