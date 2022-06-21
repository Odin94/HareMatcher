package de.odinmatthias.profiles

import de.odinmatthias.profiles.Vaccination.Companion.vaccinationDateTimeFormatter
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.`java-time`.date
import java.time.LocalDate
import java.time.format.DateTimeFormatter


@Serializable
data class Vaccination(val id: Int?, val profileId: Int, val disease: String, val date: String) {
    companion object {
        public val vaccinationDateTimeFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern("dd.MM.yyyy")
    }
}

object Vaccinations : IntIdTable() {
    val profile = reference("profile", Profiles)
    val disease: Column<String> = varchar("disease", 100)
    val date: Column<LocalDate> = date("date")
}

class VaccinationDAO(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<VaccinationDAO>(Vaccinations)

    var profile by ProfileDAO referencedOn Vaccinations.profile
    var disease by Vaccinations.disease
    var date by Vaccinations.date

    fun toVaccination() = Vaccination(id.value, profile.id.value, disease, date.format(vaccinationDateTimeFormatter))
}
