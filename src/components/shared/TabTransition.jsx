export default function TabTransition({ tabKey, children }) {
  return (
    <div key={tabKey} className="tab-enter">
      {children}
    </div>
  );
}
