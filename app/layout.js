import "./style.css";
export const metadata = { title: "Aryan's site archive" };
export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
