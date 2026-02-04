import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ResumeData } from '@/context/ResumeContext';

// Register standard fonts
Font.register({
    family: 'Roboto',
    fonts: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
    ],
});

Font.register({
    family: 'Merriweather',
    src: 'https://fonts.gstatic.com/s/merriweather/v28/u-4n0qyriQwlOrhSvowK_l52_wfzU1I.ttf'
});

Font.register({
    family: 'OpenSans',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/opensans/v34/mem8YaGs126MiZpBA-UFVZ0e.ttf', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/opensans/v34/mem5YaGs126MiZpBA-UN7rgOUuhp.ttf', fontWeight: 700 }
    ]
});

// --- STYLES ---

const styles = StyleSheet.create({
    page: { fontFamily: 'Roboto', fontSize: 10, lineHeight: 1.5, color: '#334155' },

    // =================================================================
    // 1. MODERN (Clean, Blue Accents, Standard)
    // =================================================================
    modernPage: { padding: 30, fontFamily: 'Roboto' },
    modernHeader: { marginBottom: 20, borderBottomWidth: 2, borderBottomColor: '#2563eb', paddingBottom: 10 },
    modernName: { fontSize: 24, fontWeight: 700, textTransform: 'uppercase', color: '#1e3a8a' },
    modernSection: { marginBottom: 15 },
    modernSectionTitle: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#2563eb', marginBottom: 6, letterSpacing: 1 },

    // =================================================================
    // 2. HARVARD (Classic, Serif, Black & White, Dense)
    // =================================================================
    harvardPage: { padding: 40, fontFamily: 'Merriweather', color: '#000000', lineHeight: 1.4 },
    harvardHeader: { alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#000000', paddingBottom: 10 },
    harvardName: { fontSize: 20, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 },
    harvardContact: { fontSize: 9, flexDirection: 'row', gap: 5 },
    harvardSectionTitle: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: '#000000', marginBottom: 8, marginTop: 12 },
    harvardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
    harvardBold: { fontWeight: 700, fontSize: 10 },
    harvardItalic: { fontSize: 10, fontStyle: 'italic' },

    // =================================================================
    // 3. EXECUTIVE (Bold Header Block, 2-Column, Navy)
    // =================================================================
    execPage: { padding: 0, fontFamily: 'OpenSans', backgroundColor: '#FFFFFF' },
    execHeaderBlock: { backgroundColor: '#1e293b', padding: 40, color: '#FFFFFF', marginBottom: 30 },
    execName: { fontSize: 28, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 },
    execSubtitle: { fontSize: 11, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' },
    execBody: { paddingHorizontal: 40, flexDirection: 'row', gap: 30 },
    execLeftCol: { width: '65%' },
    execRightCol: { width: '35%', paddingTop: 5 },
    execSectionTitle: { fontSize: 12, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15, borderBottomWidth: 2, borderBottomColor: '#cbd5e1', paddingBottom: 4 },
    execRole: { fontSize: 12, fontWeight: 700, color: '#0f172a' },
    execCompany: { fontSize: 11, color: '#475569', fontStyle: 'italic', marginBottom: 4 },

    // =================================================================
    // 4. TECH (Modern, Tags, Green Accents, Clean Sans)
    // =================================================================
    techPage: { padding: 30, fontFamily: 'Roboto', color: '#334155' },
    techHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 20 },
    techName: { fontSize: 26, fontWeight: 700, color: '#0f172a' },
    techRole: { fontSize: 14, color: '#10b981', fontWeight: 500, marginTop: 2 },
    techSectionTitle: { fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12, marginTop: 15 },
    techTagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    techTag: { backgroundColor: '#f0fdf4', color: '#15803d', fontSize: 9, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, border: '1px solid #bbf7d0' },

    // =================================================================
    // 5. ELEGANT (Centered, Serif, Minimal, Gold Accents)
    // =================================================================
    elegantPage: { padding: 50, fontFamily: 'Merriweather', color: '#4a4a4a' },
    elegantHeader: { alignItems: 'center', marginBottom: 40 },
    elegantName: { fontSize: 32, fontWeight: 700, color: '#2d2d2d', marginBottom: 8, letterSpacing: -0.5 },
    elegantContact: { fontSize: 9, color: '#888', letterSpacing: 1, textTransform: 'uppercase' },
    elegantDivider: { width: 40, height: 1, backgroundColor: '#d4af37', marginTop: 15, marginBottom: 15 }, // Gold Divider
    elegantSectionTitle: { fontSize: 10, fontWeight: 700, color: '#d4af37', textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center', marginBottom: 20, marginTop: 10 },
    elegantExpBlock: { marginBottom: 20, alignItems: 'center' },

    // =================================================================
    // 6. CREATIVE (Sidebar, Purple - Existing)
    // =================================================================
    creativePage: { flexDirection: 'row', backgroundColor: '#FFFFFF' },
    creativeSidebar: { width: '35%', backgroundColor: '#2E1065', padding: 24, color: '#fff', height: '100%' },
    creativeMain: { width: '65%', padding: 24, paddingTop: 40 },
    creativeName: { fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 4, letterSpacing: 1 },
    creativeSidebarTitle: { fontSize: 11, fontWeight: 700, color: '#DDD6FE', marginTop: 24, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 2, borderBottomWidth: 1, borderBottomColor: '#5B21B6', paddingBottom: 2 },

    // Common Helpers
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    textSmall: { fontSize: 9, color: '#64748b' },
});

interface Props {
    data: ResumeData;
}

// --- LAYOUT COMPONENTS ---

const ModernLayout = ({ data }: { data: ResumeData }) => (
    <Page size="A4" style={styles.modernPage}>
        <View style={styles.modernHeader}>
            <Text style={styles.modernName}>{data.personal.fullName}</Text>
            <Text style={{ fontSize: 10, marginTop: 4 }}>{data.personal.email} • {data.personal.phone} • {data.personal.location}</Text>
            <Text style={{ fontSize: 10 }}>{data.personal.linkedin}</Text>
        </View>

        {data.experience.length > 0 && (
            <View style={styles.modernSection}>
                <Text style={styles.modernSectionTitle}>Experience</Text>
                {data.experience.map(exp => (
                    <View key={exp.id} style={{ marginBottom: 8 }}>
                        <View style={styles.row}>
                            <Text style={{ fontWeight: 700 }}>{exp.role}</Text>
                            <Text style={styles.textSmall}>{exp.startDate} - {exp.endDate}</Text>
                        </View>
                        <Text style={{ fontStyle: 'italic', fontSize: 10, marginBottom: 2 }}>{exp.company}</Text>
                        <Text style={{ fontSize: 10 }}>{exp.description}</Text>
                    </View>
                ))}
            </View>
        )}

        {data.education.length > 0 && (
            <View style={styles.modernSection}>
                <Text style={styles.modernSectionTitle}>Education</Text>
                {data.education.map(edu => (
                    <View key={edu.id} style={{ marginBottom: 6 }}>
                        <View style={styles.row}>
                            <Text style={{ fontWeight: 700 }}>{edu.school}</Text>
                            <Text style={styles.textSmall}>{edu.gradYear}</Text>
                        </View>
                        <Text style={{ fontSize: 10 }}>{edu.degree}</Text>
                    </View>
                ))}
            </View>
        )}

        <View style={styles.modernSection}>
            <Text style={styles.modernSectionTitle}>Skills</Text>
            <Text style={{ fontSize: 10 }}>{data.skills.join(', ')}</Text>
        </View>
    </Page>
);

const HarvardLayout = ({ data }: { data: ResumeData }) => (
    <Page size="A4" style={styles.harvardPage}>
        <View style={styles.harvardHeader}>
            <Text style={styles.harvardName}>{data.personal.fullName}</Text>
            <View style={styles.harvardContact}>
                <Text>{data.personal.email}</Text>
                <Text>•</Text>
                <Text>{data.personal.phone}</Text>
                <Text>•</Text>
                <Text>{data.personal.location}</Text>
            </View>
        </View>

        {/* Dense, efficient layout */}
        <View>
            <Text style={styles.harvardSectionTitle}>Experience</Text>
            {data.experience.map(exp => (
                <View key={exp.id} style={{ marginBottom: 8 }}>
                    <View style={styles.harvardRow}>
                        <Text style={styles.harvardBold}>{exp.company}</Text>
                        <Text style={styles.harvardBold}>{exp.startDate} – {exp.endDate}</Text>
                    </View>
                    <View style={styles.harvardRow}>
                        <Text style={styles.harvardItalic}>{exp.role}</Text>
                        <Text style={styles.harvardItalic}>{exp.location}</Text>
                    </View>
                    <Text style={{ fontSize: 10, marginTop: 2 }}>• {exp.description}</Text>
                </View>
            ))}
        </View>

        <View>
            <Text style={styles.harvardSectionTitle}>Education</Text>
            {data.education.map(edu => (
                <View key={edu.id} style={{ marginBottom: 4 }}>
                    <View style={styles.harvardRow}>
                        <Text style={styles.harvardBold}>{edu.school}</Text>
                        <Text style={styles.harvardBold}>{edu.gradYear}</Text>
                    </View>
                    <Text style={styles.harvardItalic}>{edu.degree}</Text>
                </View>
            ))}
        </View>

        <View>
            <Text style={styles.harvardSectionTitle}>Skills</Text>
            <Text style={{ fontSize: 10 }}>{data.skills.join(', ')}</Text>
        </View>
    </Page>
);

const ExecutiveLayout = ({ data }: { data: ResumeData }) => (
    <Page size="A4" style={styles.execPage}>
        <View style={styles.execHeaderBlock}>
            <Text style={styles.execName}>{data.personal.fullName}</Text>
            <Text style={styles.execSubtitle}>{data.personal.email}  •  {data.personal.phone}</Text>
            <Text style={styles.execSubtitle}>{data.personal.linkedin}</Text>
        </View>

        <View style={styles.execBody}>
            {/* Main Column */}
            <View style={styles.execLeftCol}>
                <Text style={styles.execSectionTitle}>Experience</Text>
                {data.experience.map(exp => (
                    <View key={exp.id} style={{ marginBottom: 20 }}>
                        <Text style={styles.execRole}>{exp.role}</Text>
                        <Text style={styles.execCompany}>{exp.company}  |  {exp.startDate} - {exp.endDate}</Text>
                        <Text style={{ fontSize: 10, color: '#334155', lineHeight: 1.6 }}>{exp.description}</Text>
                    </View>
                ))}
            </View>

            {/* Sidebar Column */}
            <View style={styles.execRightCol}>
                <Text style={styles.execSectionTitle}>Education</Text>
                {data.education.map(edu => (
                    <View key={edu.id} style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: 10, fontWeight: 700 }}>{edu.school}</Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>{edu.degree}</Text>
                        <Text style={{ fontSize: 10, color: '#94a3b8' }}>{edu.gradYear}</Text>
                    </View>
                ))}

                <Text style={[styles.execSectionTitle, { marginTop: 20 }]}>Skills</Text>
                {data.skills.map((s, i) => (
                    <Text key={i} style={{ fontSize: 10, marginBottom: 4, color: '#475569' }}>• {s}</Text>
                ))}
            </View>
        </View>
    </Page>
);

const TechLayout = ({ data }: { data: ResumeData }) => (
    <Page size="A4" style={styles.techPage}>
        <View style={styles.techHeader}>
            <View>
                <Text style={styles.techName}>{data.personal.fullName}</Text>
                <Text style={styles.techRole}>Full Stack Developer</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.textSmall}>{data.personal.email}</Text>
                <Text style={styles.textSmall}>{data.personal.phone}</Text>
                <Text style={styles.textSmall}>{data.personal.linkedin}</Text>
            </View>
        </View>

        <View>
            <Text style={styles.techSectionTitle}>Technical Skills</Text>
            <View style={styles.techTagContainer}>
                {data.skills.map((s, i) => (
                    <Text key={i} style={styles.techTag}>{s}</Text>
                ))}
            </View>
        </View>

        <View>
            <Text style={styles.techSectionTitle}>Experience</Text>
            {data.experience.map(exp => (
                <View key={exp.id} style={{ marginBottom: 15, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#e2e8f0' }}>
                    <Text style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{exp.role}</Text>
                    <Text style={{ fontSize: 10, color: '#10b981', marginBottom: 4, fontWeight: 500 }}>{exp.company}</Text>
                    <Text style={{ fontSize: 10, color: '#64748b' }}>{exp.description}</Text>
                </View>
            ))}
        </View>
    </Page>
);

const ElegantLayout = ({ data }: { data: ResumeData }) => (
    <Page size="A4" style={styles.elegantPage}>
        <View style={styles.elegantHeader}>
            <Text style={styles.elegantName}>{data.personal.fullName}</Text>
            <Text style={styles.elegantContact}>{data.personal.location}</Text>
            <View style={styles.elegantDivider} />
            <Text style={styles.elegantContact}>{data.personal.email}  /  {data.personal.phone}</Text>
        </View>

        <View>
            <Text style={styles.elegantSectionTitle}>Professional History</Text>
            {data.experience.map(exp => (
                <View key={exp.id} style={styles.elegantExpBlock}>
                    <Text style={{ fontSize: 12, fontWeight: 700, fontStyle: 'italic', marginBottom: 2 }}>{exp.role}</Text>
                    <Text style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>{exp.company}  •  {exp.startDate} - {exp.endDate}</Text>
                    <Text style={{ fontSize: 10, textAlign: 'center', maxWidth: '80%', lineHeight: 1.6 }}>{exp.description}</Text>
                </View>
            ))}
        </View>

        <View style={{ marginTop: 20 }}>
            <Text style={styles.elegantSectionTitle}>Education</Text>
            {data.education.map(edu => (
                <View key={edu.id} style={{ alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: 700 }}>{edu.school}</Text>
                    <Text style={{ fontSize: 10, color: '#666' }}>{edu.degree}</Text>
                </View>
            ))}
        </View>

        <View style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={styles.elegantSectionTitle}>Expertise</Text>
            <Text style={{ fontSize: 10, textAlign: 'center', maxWidth: '70%' }}>{data.skills.join('  •  ')}</Text>
        </View>
    </Page>
);


const CreativeLayout = ({ data }: { data: ResumeData }) => (
    <Page size="A4" style={styles.creativePage}>
        {/* Left Sidebar */}
        <View style={styles.creativeSidebar}>
            <View style={{ marginBottom: 20 }}>
                <Text style={styles.creativeName}>{data.personal.fullName.split(' ')[0]}</Text>
                <Text style={{ fontSize: 20, fontWeight: 300, color: '#ddd' }}>{data.personal.fullName.split(' ').slice(1).join(' ')}</Text>
            </View>

            <Text style={{ fontSize: 10, color: '#ccc', marginBottom: 20 }}>{data.personal.bio}</Text>

            <Text style={styles.creativeSidebarTitle}>Contact</Text>
            <Text style={{ fontSize: 9, color: '#ccc', marginBottom: 4 }}>{data.personal.email}</Text>
            <Text style={{ fontSize: 9, color: '#ccc', marginBottom: 4 }}>{data.personal.phone}</Text>
            <Text style={{ fontSize: 9, color: '#ccc', marginBottom: 15 }}>{data.personal.location}</Text>

            <Text style={styles.creativeSidebarTitle}>Education</Text>
            {data.education.map(edu => (
                <View key={edu.id} style={{ marginBottom: 10 }}>
                    <Text style={{ fontWeight: 700, fontSize: 9, color: '#fff' }}>{edu.degree}</Text>
                    <Text style={{ fontSize: 9, color: '#ccc' }}>{edu.school}, {edu.gradYear}</Text>
                </View>
            ))}

            <Text style={styles.creativeSidebarTitle}>Skills</Text>
            {data.skills.map((s, i) => (
                <Text key={i} style={{ fontSize: 9, color: '#ccc', marginBottom: 2 }}>• {s}</Text>
            ))}
        </View>

        {/* Main Content */}
        <View style={styles.creativeMain}>
            <Text style={{ fontSize: 14, fontWeight: 700, color: '#1e1b4b', borderBottomWidth: 2, borderBottomColor: '#1e1b4b', marginBottom: 10, textTransform: 'uppercase' }}>
                Experience
            </Text>
            {data.experience.map(exp => (
                <View key={exp.id} style={{ marginBottom: 15 }}>
                    <Text style={{ fontSize: 12, fontWeight: 700, color: '#1e1b4b' }}>{exp.role}</Text>
                    <View style={styles.row}>
                        <Text style={{ fontSize: 10, color: '#4338ca', fontWeight: 500 }}>{exp.company}</Text>
                        <Text style={{ fontSize: 9, color: '#64748b' }}>{exp.startDate} - {exp.endDate}</Text>
                    </View>
                    <Text style={{ fontSize: 10, color: '#334155', marginTop: 4, lineHeight: 1.4 }}>{exp.description}</Text>
                </View>
            ))}

            {data.projects.length > 0 && (
                <View>
                    <Text style={{ fontSize: 14, fontWeight: 700, color: '#1e1b4b', borderBottomWidth: 2, borderBottomColor: '#1e1b4b', marginBottom: 10, marginTop: 10, textTransform: 'uppercase' }}>
                        Projects
                    </Text>
                    {data.projects.map(proj => (
                        <View key={proj.id} style={{ marginBottom: 10 }}>
                            <Text style={{ fontSize: 11, fontWeight: 700 }}>{proj.name}</Text>
                            <Text style={{ fontSize: 10 }}>{proj.description}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    </Page>
);


const PDFDocument = ({ data }: Props) => {
    switch (data.templateId) {
        case 'harvard': return <Document><HarvardLayout data={data} /></Document>;
        case 'creative': return <Document><CreativeLayout data={data} /></Document>;
        case 'executive': return <Document><ExecutiveLayout data={data} /></Document>;
        case 'tech': return <Document><TechLayout data={data} /></Document>;
        case 'elegant': return <Document><ElegantLayout data={data} /></Document>;
        case 'modern':
        default: return <Document><ModernLayout data={data} /></Document>;
    }
};

export default PDFDocument;
