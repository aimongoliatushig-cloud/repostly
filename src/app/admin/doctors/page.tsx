import { PostlyShell } from "@/components/postly-shell";
import { SectionCard } from "@/components/section-card";
import { doctors } from "@/lib/postly-data";

export default function DoctorsAdminPage() {
  return (
    <PostlyShell
      activePath="/admin/doctors"
      eyebrow="Эмчийн админ"
      title="Эмчийн сан ба мэргэжлийн удирдлага"
      description="Админ эмч нэмэх, зураг upload хийх, specialization assign хийх, brand-тай нь холбох үндсэн page."
    >
      <section className="grid-2">
        <SectionCard
          title="Шинэ эмч нэмэх"
          description="Doctor portrait, specialization, brand assignment-ийг нэг формоор бүртгэнэ."
        >
          <form className="field-grid">
            <label>
              <span className="field-label">Эмчийн нэр</span>
              <input className="field" placeholder="О. Наранцацрал" />
            </label>
            <label>
              <span className="field-label">Мэргэжил</span>
              <input className="field" placeholder="Уушгины эмч" />
            </label>
            <label>
              <span className="field-label">Брэнд</span>
              <select className="select" defaultValue="sergeen">
                <option value="sergeen">Сэргээн Клиник</option>
                <option value="enerel">Энэрэл эмнэлэг</option>
              </select>
            </label>
            <label>
              <span className="field-label">Зураг upload</span>
              <input className="field" placeholder="doctor-portrait.png" />
            </label>
            <button type="button" className="button-primary">
              Эмч хадгалах
            </button>
          </form>
        </SectionCard>

        <SectionCard
          title="Admin note"
          description="Doctor сан нь B-roll урсгалын doctor picker болон brand dashboard-д зэрэг хэрэглэгдэнэ."
        >
          <div className="stack-sm">
            <article className="table-row">
              <strong>Image quality</strong>
              <p className="muted-text">
                Цэвэр background-тай portrait зураг байх тусам face continuity болон visual trust өснө.
              </p>
            </article>
            <article className="table-row">
              <strong>Specialization</strong>
              <p className="muted-text">
                Topic generation дээр prompt context болгож шууд ашиглагдана.
              </p>
            </article>
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Одоогийн эмч нар"
        description="Brand бүрийн doctor inventory card view."
      >
        <div className="grid-3">
          {doctors.map((doctor) => (
            <article key={doctor.id} className="panel-card stack-sm">
              <div className="action-row" style={{ justifyContent: "space-between" }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(27, 168, 146, 0.14)",
                    color: "var(--accent-strong)",
                    fontWeight: 800,
                  }}
                >
                  {doctor.initials}
                </div>
                <span className="badge">{doctor.brandName}</span>
              </div>
              <div className="stack-xs">
                <strong>{doctor.fullName}</strong>
                <p className="muted-text">{doctor.specialization}</p>
              </div>
              <p className="muted-text">{doctor.availability}</p>
              <div className="action-row">
                <button type="button" className="button-secondary">
                  Засах
                </button>
                <button type="button" className="button-ghost">
                  Архивлах
                </button>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </PostlyShell>
  );
}
