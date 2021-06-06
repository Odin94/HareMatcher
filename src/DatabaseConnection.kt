package de.odinmatthias

import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.transactions.TransactionManager
import org.jetbrains.exposed.sql.transactions.transaction
import users.Users
import java.nio.file.Paths
import java.sql.Connection


class DatabaseConnector() {
    init {
        connect()
        createSchema()

        transaction {
            addLogger(StdOutSqlLogger)
        }
    }

    private fun connect() {
        val projectPath = Paths.get("").toAbsolutePath().toString()
        Database.connect("jdbc:sqlite:${projectPath}/database/db.sqlite", "org.sqlite.JDBC")
        TransactionManager.manager.defaultIsolationLevel = Connection.TRANSACTION_SERIALIZABLE
    }

    private fun createSchema() {
        transaction {
            SchemaUtils.create(Users)
        }
    }

    suspend fun <T> dbQuery(block: () -> T): T = transaction { block() }
}