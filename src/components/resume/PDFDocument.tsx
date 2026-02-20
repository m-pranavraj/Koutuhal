import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ResumeData } from '@/context/ResumeContext';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
    },
    header: {
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        paddingBottom: 10,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#000000',
    },
    contact: {
        fontSize: 9,
        color: '#555555',
        marginBottom: 2,
    },
    sectionHeading: {
        fontSize: 11,
        fontWeight: 'bold',
        marginTop: 14,
        marginBottom: 6,
        textTransform: 'uppercase',
        color: '#000000',
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        paddingBottom: 2,
    },
    text: {
        fontSize: 10,
        marginBottom: 3,
        lineHeight: 1.5,
        color: '#333333',
    },
    bold: {
        fontWeight: 'bold',
        color: '#111111',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    bullet: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    bulletDot: {
        width: 10,
        fontSize: 10,
        color: '#333333',
    },
    bulletText: {
        flex: 1,
        fontSize: 10,
        lineHeight: 1.5,
        color: '#333333',
    },
});

const PDFDocument = ({ data }: { data: ResumeData }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <Text style={styles.name}>{data.personal.fullName || 'Your Name'}</Text>
                {data.personal.email && <Text style={styles.contact}>{data.personal.email}</Text>}
                {data.personal.phone && <Text style={styles.contact}>{data.personal.phone}</Text>}
                {data.personal.location && <Text style={styles.contact}>{data.personal.location}</Text>}
                {data.personal.linkedin && <Text style={styles.contact}>{data.personal.linkedin}</Text>}
                {data.personal.website && <Text style={styles.contact}>{data.personal.website}</Text>}
            </View>

            {/* ── Bio / Summary ── */}
            {data.personal.bio && (
                <View>
                    <Text style={styles.sectionHeading}>Summary</Text>
                    <Text style={styles.text}>{data.personal.bio}</Text>
                </View>
            )}

            {/* ── Experience ── */}
            {data.experience.length > 0 && (
                <View>
                    <Text style={styles.sectionHeading}>Experience</Text>
                    {data.experience.map((exp) => (
                        <View key={exp.id} style={{ marginBottom: 8 }}>
                            <View style={styles.row}>
                                <Text style={[styles.text, styles.bold]}>{exp.role} — {exp.company}</Text>
                                <Text style={styles.text}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</Text>
                            </View>
                            {exp.location && <Text style={[styles.text, { color: '#666666' }]}>{exp.location}</Text>}
                            {exp.description && (
                                <View style={styles.bullet}>
                                    <Text style={styles.bulletDot}>•  </Text>
                                    <Text style={styles.bulletText}>{exp.description}</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            )}

            {/* ── Education ── */}
            {data.education.length > 0 && (
                <View>
                    <Text style={styles.sectionHeading}>Education</Text>
                    {data.education.map((edu) => (
                        <View key={edu.id} style={{ marginBottom: 6 }}>
                            <View style={styles.row}>
                                <Text style={[styles.text, styles.bold]}>{edu.degree}</Text>
                                <Text style={styles.text}>{edu.gradYear}</Text>
                            </View>
                            <Text style={[styles.text, { color: '#666666' }]}>{edu.school}{edu.location ? `, ${edu.location}` : ''}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* ── Skills ── */}
            {data.skills.length > 0 && (
                <View>
                    <Text style={styles.sectionHeading}>Skills</Text>
                    <Text style={styles.text}>{data.skills.join(' • ')}</Text>
                </View>
            )}

            {/* ── Projects ── */}
            {data.projects.length > 0 && (
                <View>
                    <Text style={styles.sectionHeading}>Projects</Text>
                    {data.projects.map((proj) => (
                        <View key={proj.id} style={{ marginBottom: 6 }}>
                            <Text style={[styles.text, styles.bold]}>{proj.name}{proj.link ? ` — ${proj.link}` : ''}</Text>
                            {proj.description && <Text style={styles.text}>{proj.description}</Text>}
                        </View>
                    ))}
                </View>
            )}
        </Page>
    </Document>
);

export default PDFDocument;
