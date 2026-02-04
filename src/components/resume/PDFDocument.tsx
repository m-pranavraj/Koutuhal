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

const styles = StyleSheet.create({
    page: {
        padding: 30, // 30pt padding (~1cm)
        fontFamily: 'Roboto',
        fontSize: 10,
        lineHeight: 1.5,
        color: '#0f172a', // Slate-900
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#334155', // Slate-700
        paddingBottom: 10,
    },
    name: {
        fontSize: 24,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    bio: {
        fontSize: 10,
        color: '#475569', // Slate-600
        marginBottom: 6,
    },
    contactRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
        fontSize: 9,
        color: '#475569',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0', // Slate-200
        marginBottom: 8,
        paddingBottom: 2,
        color: '#1e293b', // Slate-800
    },
    experienceItem: {
        marginBottom: 10,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 2,
    },
    role: {
        fontSize: 11,
        fontWeight: 700,
        color: '#0f172a',
    },
    company: {
        fontSize: 10,
        fontWeight: 500,
        color: '#334155',
        fontStyle: 'italic',
    },
    date: {
        fontSize: 9,
        color: '#64748b',
    },
    description: {
        fontSize: 10,
        color: '#334155',
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
    },
    skill: {
        backgroundColor: '#f1f5f9', // Slate-100
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 2,
        fontSize: 9,
        color: '#334155',
    },
});

interface Props {
    data: ResumeData;
}

const PDFDocument = ({ data }: Props) => {
    const { personal, experience, education, skills, projects } = data;

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{personal.fullName || 'YOUR NAME'}</Text>
                    {personal.bio && <Text style={styles.bio}>{personal.bio}</Text>}

                    <View style={styles.contactRow}>
                        {personal.email && <Text>{personal.email}</Text>}
                        {personal.phone && <Text>•  {personal.phone}</Text>}
                        {personal.location && <Text>•  {personal.location}</Text>}
                        {personal.linkedin && <Text>•  {personal.linkedin}</Text>}
                    </View>
                </View>

                {/* Experience */}
                {experience.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Professional Experience</Text>
                        {experience.map((exp) => (
                            <View key={exp.id} style={styles.experienceItem}>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.role}>{exp.role}</Text>
                                    <Text style={styles.date}>{exp.startDate} – {exp.endDate}</Text>
                                </View>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.company}>{exp.company}</Text>
                                    <Text style={styles.date}>{exp.location}</Text>
                                </View>
                                <Text style={styles.description}>{exp.description}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Projects */}
                {projects.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Projects</Text>
                        {projects.map((proj) => (
                            <View key={proj.id} style={styles.experienceItem}>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.role}>{proj.name}</Text>
                                    {proj.link && <Text style={styles.date}>{proj.link}</Text>}
                                </View>
                                <Text style={styles.description}>{proj.description}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Education */}
                {education.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {education.map((edu) => (
                            <View key={edu.id} style={styles.experienceItem}>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.role}>{edu.school}</Text>
                                    <Text style={styles.date}>{edu.gradYear}</Text>
                                </View>
                                <View style={[styles.rowBetween, { marginBottom: 0 }]}>
                                    <Text style={styles.company}>{edu.degree}</Text>
                                    <Text style={styles.date}>{edu.location}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        <View style={styles.skillsContainer}>
                            {skills.map((skill, index) => (
                                <Text key={index} style={styles.skill}>{skill}</Text>
                            ))}
                        </View>
                    </View>
                )}

            </Page>
        </Document>
    );
};

export default PDFDocument;
