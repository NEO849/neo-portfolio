import NavigationBar from "./components/NavigationBar";
import HeroView from "./views/HeroView";
import UeberMichView from "./views/UeberMichView";
import ProjekteView from "./views/ProjekteView";
import SecurityView from "./views/SecurityView";
import OsintDemoView from "./views/OsintDemoView";
import ZeugnisseView from "./views/ZeugnisseView";
import SkillsView from "./views/SkillsView";
import KontaktView from "./views/KontaktView";

export default function App() {
  return (
    <>
      <NavigationBar />
      <main>
        <HeroView />
        <div className="akzent-linie mx-6" />
        <UeberMichView />
        <div className="akzent-linie mx-6" />
        <ProjekteView />
        <div className="akzent-linie mx-6" />
        <SecurityView />
        <div className="akzent-linie mx-6" />
        <OsintDemoView />
        <div className="akzent-linie mx-6" />
        <ZeugnisseView />
        <div className="akzent-linie mx-6" />
        <SkillsView />
        <div className="akzent-linie mx-6" />
        <KontaktView />
      </main>
      <footer className="py-8 text-center text-xs text-white/15 font-mono">
        © {new Date().getFullYear()} Michael Fleps
      </footer>
    </>
  );
}
