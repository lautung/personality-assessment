import { Plus, Trash2, UserRound } from "lucide-react";

export default function ProfileSwitcher({ profiles, activeProfileId, onSwitch, onAdd, onRemove }) {
  const activeProfile = profiles.find((profile) => profile.id === activeProfileId) ?? profiles[0];

  function handleAdd() {
    const name = window.prompt("输入本地用户名称", `用户 ${profiles.length + 1}`);
    if (name !== null) onAdd(name);
  }

  return (
    <div className="profile-switcher" aria-label="本地用户档案">
      <span className="profile-label">
        <UserRound size={16} aria-hidden="true" />
        <span>{activeProfile.name}</span>
      </span>
      <select value={activeProfileId} onChange={(event) => onSwitch(event.target.value)} aria-label="切换本地用户">
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.name}
          </option>
        ))}
      </select>
      <button type="button" className="icon-button" onClick={handleAdd} aria-label="新增本地用户">
        <Plus size={16} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="icon-button"
        onClick={() => onRemove(activeProfileId)}
        aria-label="删除当前本地用户"
        disabled={profiles.length <= 1}
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
