package com.ems;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class DbFix {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection(
                    "jdbc:mysql://localhost:3306/ems_db?useSSL=false&allowPublicKeyRetrieval=true", "root", "12345");
            Statement stmt = conn.createStatement();
            stmt.executeUpdate("ALTER TABLE attendance MODIFY COLUMN status VARCHAR(50)");
            System.out.println("SUCCESS_DB_FIX");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
